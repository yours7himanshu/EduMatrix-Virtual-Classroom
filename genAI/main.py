import os
from dotenv import load_dotenv
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage, SystemMessage


load_dotenv();
gimini_api_key=os.getenv("GIMINI_API_KEY");
langchain_api_key = os.getenv("LANGCHAIN_API_KEY");

model = ChatVertexAI(model="gemini-1.5-flash")

# Define the conversation
messages = [
    SystemMessage("Always there to help you"),
    HumanMessage("hi!"),
]

# Invoke the model
response = model.invoke(messages)

# Print the response
print(response)