const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generateContent = async (req, res) => {
  try {
    const prompt = req.body?.prompt;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Valid prompt string is required",
      });
    }

    const apiKey = process.env.GIMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: "AI service is currently unavailable: GEMINI_API_KEY is not configured",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt.trim());
    const text = result?.response?.text ? result.response.text() : "";

    return res.status(200).json({
      success: true,
      generatedText: text,
    });
  } catch (error) {
    console.error("AI Controller generation error:", error.message);
    return res.status(500).json({
      success: false,
      error: "AI processing failed",
      details: error.message,
    });
  }
};