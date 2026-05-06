from __future__ import annotations

import json
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials

from database import User, get_db
from email_service import send_welcome_email

# Initialize Firebase Admin SDK
cred_path_or_json = os.getenv("FIREBASE_CREDENTIALS")
if not firebase_admin._apps:
    if cred_path_or_json:
        try:
            # Check if it's a JSON string
            cred_dict = json.loads(cred_path_or_json)
            cred = credentials.Certificate(cred_dict)
        except json.JSONDecodeError:
            # Otherwise assume it's a path
            cred = credentials.Certificate(cred_path_or_json)
        firebase_admin.initialize_app(cred)
    else:
        print("WARNING: FIREBASE_CREDENTIALS not set. Auth will fail.")

bearer_scheme = HTTPBearer(auto_error=False)


def _resolve_user(token: str, db: Session) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token.",
    )
    
    if not firebase_admin._apps:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase Admin SDK not initialized."
        )

    try:
        decoded_token = firebase_auth.verify_id_token(token)
        google_id = decoded_token.get("uid")
        email = decoded_token.get("email")
        display_name = decoded_token.get("name", "User")
        photo_url = decoded_token.get("picture", "")

        if not google_id or not email:
            raise credentials_exception
            
    except Exception as exc:
        print(f"Token verification failed: {exc}")
        raise credentials_exception

    # Find or Create User
    user = db.query(User).filter(User.google_id == google_id).first()
    
    if not user:
        # Create user
        user = User(
            google_id=google_id,
            email=email,
            display_name=display_name,
            photo_url=photo_url,
            first_login=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Send welcome email asynchronously or synchronously
        send_welcome_email(user.email, user.display_name.split()[0] if user.display_name else "User")
        
        # Update first_login so we don't send it again
        user.first_login = False
        db.commit()
        db.refresh(user)
    else:
        # Update display_name/photo_url if they changed
        if user.display_name != display_name or user.photo_url != photo_url:
            user.display_name = display_name
            user.photo_url = photo_url
            db.commit()
            db.refresh(user)

    return user


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if creds is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    return _resolve_user(creds.credentials, db)


def get_optional_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    if creds is None:
        return None
    try:
        return _resolve_user(creds.credentials, db)
    except HTTPException:
        return None
