import fitz  # PyMuPDF
import re
from typing import Dict
from docx import Document
import os

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text("text")
    return text

def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs])

def parse_resume(file_path: str) -> Dict[str, str]:
<<<<<<< HEAD
<<<<<<< HEAD
    # Detect file type
=======
    # Extract text based on file type
>>>>>>> a5888acac09cf0a12d7e98944f7d6e1d7c0daa79
=======
    # Extract text based on file type
>>>>>>> de4702b9d975366e6415d4b2c5e4682832599e1a
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        text = extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        text = extract_text_from_docx(file_path)
    else:
        return {"error": "Unsupported file format"}

    text = text.replace("\n", " ").strip()

    # ---- EMAIL ----
    email = re.findall(r"[\w\.-]+@[\w\.-]+", text)
<<<<<<< HEAD
<<<<<<< HEAD

    # ---- PHONE ----
    phone = re.findall(r"\b\d{10}\b", text)

    # ---- FULL NAME ----
    name = ""
    if email:
        before_email = text.split(email[0])[0]
=======
=======
>>>>>>> de4702b9d975366e6415d4b2c5e4682832599e1a
    
    # ---- PHONE ----
    phone = re.findall(r"\b\d{10}\b", text)
    
    # ---- FULL NAME ----
    # Strategy:
    # Usually, the name appears before email or phone in resumes
    # So we extract text before the first email and take up to 3 words
    name = ""
    if email:
        before_email = text.split(email[0])[0]
        # Match likely names (capitalized words)
<<<<<<< HEAD
>>>>>>> a5888acac09cf0a12d7e98944f7d6e1d7c0daa79
=======
>>>>>>> de4702b9d975366e6415d4b2c5e4682832599e1a
        name_match = re.findall(r"([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,3})", before_email)
        if name_match:
            name = name_match[-1].strip()
    else:
<<<<<<< HEAD
<<<<<<< HEAD
=======
        # Fallback: first 2–3 words from top of document
>>>>>>> a5888acac09cf0a12d7e98944f7d6e1d7c0daa79
=======
        # Fallback: first 2–3 words from top of document
>>>>>>> de4702b9d975366e6415d4b2c5e4682832599e1a
        tokens = text.split()
        name = " ".join(tokens[:3]) if len(tokens) >= 2 else (tokens[0] if tokens else "")

    # ---- SKILLS ----
    skills_keywords = [
        "Python", "Java", "React", "Node", "Django", "C++", "SQL", 
        "AWS", "Azure", "HTML", "CSS", "JavaScript", "Machine Learning", "Data Analysis"
    ]
    skills_found = [s for s in skills_keywords if s.lower() in text.lower()]

<<<<<<< HEAD
<<<<<<< HEAD
    # ---- EXPERIENCE ----
=======
# ---- EXPERIENCE ----
>>>>>>> a5888acac09cf0a12d7e98944f7d6e1d7c0daa79
    # Look for patterns like "X years", "X+ years", "X months", etc.
    exp_match = re.findall(r"(\d+\+?\s?(?:year|years|yr|yrs|month|months))", text, re.IGNORECASE)
    experience = exp_match[0] if exp_match else ""

    # ---- CURRENT COMPANY ----
    # Look for patterns like "Currently working at <Company>" or "Present" near company names
    company = ""
    company_patterns = [
        r"currently working at\s+([A-Z][A-Za-z0-9&\s,.]+)",
        r"working at\s+([A-Z][A-Za-z0-9&\s,.]+)",
        r"at\s+([A-Z][A-Za-z0-9&\s,.]+)\s+\(Present\)",
        r"([A-Z][A-Za-z0-9&\s,.]+)\s+\(Present\)"
    ]

    for pattern in company_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            company = match.group(1).strip().rstrip(",.")
            break
<<<<<<< HEAD

=======
>>>>>>> a5888acac09cf0a12d7e98944f7d6e1d7c0daa79
=======
>>>>>>> de4702b9d975366e6415d4b2c5e4682832599e1a
    return {
        "name": name,
        "email": email[0] if email else "",
        "phone": phone[0] if phone else "",
        "skills": ", ".join(skills_found)
    }
