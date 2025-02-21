
from transformers import pipeline
import sys
import json
import torch

# Log GPU info to stderr for debugging
print(f"CUDA Available: {torch.cuda.is_available()}", file=sys.stderr)
print(f"Device: {torch.cuda.get_device_name(0)}", file=sys.stderr)

# Set up the generator with GPU
generator = pipeline("text-generation", model="gpt2", device=0)

def generate_text(prompt):
    result = generator(prompt, max_length=1000, num_return_sequences=1, truncation=True)
    return result[0]["generated_text"]

if __name__ == "__main__":
    prompt = sys.argv[1]  # Get input from Node.js
    output = generate_text(prompt)
    print(json.dumps({"result": output}))  # Return JSON to Node.js