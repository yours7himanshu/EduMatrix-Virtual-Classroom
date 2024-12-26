import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AiAssistent = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchOutput = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/ai-assistent`);
      if (response.data.success) {
        setOutput(response.data.output); // Assuming 'output' is what we want to display
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch AI response");
      console.error("Error fetching AI output:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/ai-assistent`, { input });
      if (response.data.success) {
        setOutput(response.data.output);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred while submitting your question");
      console.error("Error submitting question:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // This might not be necessary if you only want to fetch on form submit
    // fetchOutput();
  }, [backendUrl]); // Removed fetchOutput dependency since it's not needed

  return (
    <div>
      <form className="mt-[20%]" onSubmit={handleSubmit}>
        <textarea
          className="text-black"
          value={input}
          required
          rows="4"
          placeholder="Ask any question here..."
          onChange={(e) => setInput(e.target.value)}
          name="Question"
          id="Question"
        />

        <button disabled={loading} type="submit">
          {loading ? "Generating a response, please wait..." : "Ask a Question"}
        </button>
      </form>

      <div className="receivingContainer">
        {output && <p>{output}</p>}
      </div>
    </div>
  );
};

export default AiAssistent;