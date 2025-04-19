import PyPDF2

f=open("python_rec/Study_Notes_3_Pages.pdf","rb")
r= PyPDF2.PdfReader(f)
text = ""
for page in r.pages:
    text += page.extract_text()

print(text)
