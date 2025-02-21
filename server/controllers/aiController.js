const { spawn } = require("child_process");

exports.generateContent = (req, res) => {
  const prompt = req.body.prompt || "Default prompt";
  const pythonProcess = spawn("python", ["../genAI/ai_script.py", prompt]);

  let output = "";
  let errorOutput = "";

  pythonProcess.stdout.on("data", (data) => {
    output += data.toString(); // Capture the generated text
  });

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString(); // Capture informational messages
  });

  pythonProcess.on("close", (code) => {
    if (errorOutput) {
      console.warn(`Python stderr: ${errorOutput}`); // Log warnings, not errors
    }

    if (code !== 0) {
      // Real failure: Python exited with an error
      res.status(500).json({ error: "AI processing failed", details: errorOutput });
    } else {
      // Success: Process the output
      try {
        const result = JSON.parse(output);
        res.json({ generatedText: result.result });
      } catch (error) {
        res.status(500).json({ error: "Failed to parse output", details: output });
      }
    }
  });
};