import PyPDF2
import requests
from io import BytesIO
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path='.env')
GROQ_API_KEY= os.getenv("GROQ_API_KEY")
from groq import Groq
import json

client = Groq(api_key=GROQ_API_KEY)


def text_summarizer(pdfUrl):
        response = requests.get(pdfUrl)
        if response.status_code == 200:
            file_data = BytesIO(response.content) 
            reader = PyPDF2.PdfReader(file_data)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        else:
            print("Failed to download file.")
      

        chat_completion = client.chat.completions.create(
    
        messages=[
            # Set an optional system message. This sets the behavior of the
            # assistant and can be used to provide specific instructions for
            # how it should behave throughout the conversation.
            {
                "role": "system",
                "content": "You are helpful teacher assistant which summarises the content in the most precise way"
            },
            # Set a user message for the assistant to respond to.
            {
                "role": "user",
                "content": text,
            }
        ],

        # The language model which will generate the completion.
        model="llama-3.3-70b-versatile",

        #
        # Optional parameters
        #

        # Controls randomness: lowering results in less random completions.
        # As the temperature approaches zero, the model will become deterministic
        # and repetitive.
        temperature=0.5,

        # The maximum number of tokens to generate. Requests can use up to
        # 32,768 tokens shared between prompt and completion.
        max_completion_tokens=1024,

        # Controls diversity via nucleus sampling: 0.5 means half of all
        # likelihood-weighted options are considered.
        top_p=1,

        # A stop sequence is a predefined or user-specified text string that
        # signals an AI to stop generating content, ensuring its responses
        # remain focused and concise. Examples include punctuation marks and
        # markers like "[end]".
        stop=None,

        # If set, partial message deltas will be sent.
        stream=False,
)

# Print the completion returned by the LLM.
        return chat_completion.choices[0].message.content

if __name__ == "__main__":
    prompt = sys.argv[1]  # Get input from Node.js
    output = text_summarizer(prompt)   
    print(json.dumps({"result": output}))  

