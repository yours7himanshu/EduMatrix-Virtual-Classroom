
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch
import PyPDF2
import requests
from io import BytesIO
from dotenv import load_dotenv
import os
import sys
import json
load_dotenv(dotenv_path='server/.env')
open_ai_api_key= os.getenv("OPEN_AI-API_KEY")

def text_summarizer(url):
        response = requests.get(url)
        if response.status_code == 200:
            file_data = BytesIO(response.content) 
            reader = PyPDF2.PdfReader(file_data)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        else:
            print("Failed to download file.")

        model_name = "t5-small"
        tokenizer = T5Tokenizer.from_pretrained(model_name)
        model = T5ForConditionalGeneration.from_pretrained(model_name)
        input_text = "summarize: " + text
        input_ids = tokenizer.encode(input_text, return_tensors="pt", max_length=512, truncation=True)
        summary_ids = model.generate(input_ids, max_length=100, min_length=30, length_penalty=2.0, num_beams=4, early_stopping=True)
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

if __name__ == "__main__":
    prompt = sys.argv[1] 
    output = text_summarizer(prompt)
    print(json.dumps({"result": output}))  
