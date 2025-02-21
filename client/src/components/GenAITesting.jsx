// client/src/components/AIGenerator.js
import React, { useState } from "react";
import axios from "axios";

const GenAITesting = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/api/ai/generate", { prompt });
      setGeneratedText(response.data.generatedText);
    } catch (error) {
      console.error("Error generating content:", error);
    }
  };

  return (
    <div>
      <h2>AI Content Generator</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt"
        />
        <button type="submit">Generate</button>
      </form>
      {generatedText && <p>Generated Text: {generatedText}</p>}
    </div>
  );
};

export default GenAITesting;