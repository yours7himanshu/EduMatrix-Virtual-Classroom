import PyPDF2
import requests
from io import BytesIO
import os
import sys
import json

# Load .env only in development
if os.getenv("ENV", "development") != "production":
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
from groq import Groq

client = Groq(api_key=GROQ_API_KEY)


def text_summarizer(pdfUrl):
    try:
        print(f"Attempting to download PDF from: {pdfUrl}", file=sys.stderr)
        response = requests.get(pdfUrl)
        if response.status_code == 200:
            file_data = BytesIO(response.content) 
            reader = PyPDF2.PdfReader(file_data)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            print(f"Successfully extracted text from PDF: {len(text)} characters", file=sys.stderr)
        else:
            print(f"Failed to download file: Status code {response.status_code}", file=sys.stderr)
            return f"Failed to download file: Status code {response.status_code}"
      
        chat_completion = client.chat.completions.create(
    
        messages=[
            {
                "role": "system",
                "content": "You are best topic summarization AI assistant for the students so that no student can fail in the exam"
            },
            {
                "role": "user",
                "content": text,
            }
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.5,
        max_completion_tokens=32000,
        
        )

        summary = chat_completion.choices[0].message.content
        print(f"Successfully generated summary: {len(summary)} characters", file=sys.stderr)
        return summary
    except Exception as e:
        error_message = f"Error in text_summarizer: {str(e)}"
        print(error_message, file=sys.stderr)
        return error_message

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            pdf_url = sys.argv[1]  # Get PDF URL from Node.js
            print(f"PDF URL received: {pdf_url}", file=sys.stderr)
            output = text_summarizer(pdf_url)   
            # Return result in JSON format for the controller to parse
            print(json.dumps({"result": output}))
        else:
            print(f"No PDF URL provided in command-line arguments", file=sys.stderr)
            print(json.dumps({"error": "No PDF URL provided"}))
    except Exception as e:
        error_message = f"Error in main: {str(e)}"
        print(error_message, file=sys.stderr)
        print(json.dumps({"error": error_message}))
