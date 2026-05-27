import os
import glob
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Replace text colors
    content = re.sub(r'\btext-white\b', 'text-slate-900', content)
    content = re.sub(r'\btext-white/(\d+)\b', r'text-slate-900/\1', content)
    content = re.sub(r'\btext-gray-300\b', 'text-slate-700', content)
    content = re.sub(r'\btext-gray-400\b', 'text-slate-600', content)
    content = re.sub(r'\btext-gray-200\b', 'text-slate-800', content)
    
    # Replace background and border utilities with white/light backgrounds
    content = re.sub(r'\bbg-white/5\b', 'bg-black/5', content)
    content = re.sub(r'\bbg-white/10\b', 'bg-black/10', content)
    content = re.sub(r'\bborder-white/10\b', 'border-black/10', content)
    content = re.sub(r'\bborder-white/20\b', 'border-black/20', content)
    content = re.sub(r'\bbg-gray-900/40\b', 'bg-gray-100/40', content)
    content = re.sub(r'\bbg-\[\#0B0F19\]\b', 'bg-slate-50', content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    src_dir = r"c:\Users\Gani\SkinDisease\Frontend\src"
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.jsx', '.js')):
                replace_in_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
