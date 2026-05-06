import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

def send_welcome_email(to_email: str, first_name: str) -> None:
    if not SENDGRID_API_KEY or SENDGRID_API_KEY == "your_sendgrid_api_key":
        print("SendGrid API key not configured. Skipping welcome email.")
        return

    subject = "Welcome to DermAI — Your AI Skin Analysis Platform"
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to DermAI, {first_name}!</h2>
        <p>Thank you for joining DermAI, the next-generation AI skin analysis platform.</p>
        <p>With DermAI, you can upload or capture images of skin lesions to receive an instant AI-powered prediction, along with clinical explainability maps (Grad-CAM & Saliency) that highlight which areas influenced the model's decision.</p>
        <p><strong>Disclaimer:</strong> DermAI's results are for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for any medical concerns.</p>
        <br/>
        <p>Stay healthy,<br/>The DermAI Team</p>
    </div>
    """

    message = Mail(
        from_email='no-reply@dermai.com', # Assuming you'd have a verified sender here, fallback to a real one in prod if needed
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )
    
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Welcome email sent to {to_email} with status code {response.status_code}")
    except Exception as e:
        print(f"Failed to send welcome email to {to_email}: {e}")
