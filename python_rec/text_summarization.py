import PyPDF2
import requests
from io import BytesIO
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path='server/.env')
open_ai_api_key= os.getenv("OPEN_AI-API_KEY")

url = 'https://res.cloudinary.com/dh97eoif1/image/upload/v1745061626/fneizrjsgjwluapbz8vr.pdf'

response = requests.get(url)

if response.status_code == 200:
    file_data = BytesIO(response.content) 
    reader = PyPDF2.PdfReader(file_data)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
else:
    print("Failed to download file.")


from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch

# Load model and tokenizer
model_name = "t5-small"
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

# Input text (replace with your own)
text = """
Artificial Intelligence (AI) is a rapidly advancing field that aims to simulate human intelligence in machines. 
It includes subfields like machine learning, natural language processing, robotics, and computer vision. 
AI has found applications in many industries, from healthcare and finance to entertainment and transportation.
"""

# T5 expects a task prefix for summarization
input_text = "summarize: " + text

# Tokenize input
input_ids = tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True)

# Generate summary
summary_ids = model.generate(input_ids, max_length=100, min_length=30, length_penalty=2.0, num_beams=4, early_stopping=True)

# Decode summary
summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

print("Summary:", summary)
