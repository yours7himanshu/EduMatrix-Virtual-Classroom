const cloudinary = require("cloudinary").v2;

const { spawn } = require("child_process");
const UploadPdfFile = async (req, res) => {
  let pdfUrl;
  let output = "";
  let errorOutput = "";
  if (!req.file) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
    // for python script reading
    pdfUrl = result.secure_url;
    console.log("PDF URL for Python script:", pdfUrl);

    const pythonProcess = spawn("python", [
      "../python_rec/text_summarization.py",
      pdfUrl,
    ]);
    pythonProcess.stdout.on("data", (data) => {
      console.log("Python stdout:", data.toString());
      output += data.toString();
    });
    pythonProcess.stderr.on("data", (data) => {
      console.log("Python stderr:", data.toString());
      errorOutput += data.toString();
    });
    pythonProcess.on("close", (code) => {
      console.log("Python process exited with code:", code);
      console.log("Python output:", output);
      
      if (code !== 0) {
        return res.status(404).json({
          success: false,
          message: "No output recieved",
        });
      } else {
        try {
          const parsedOutput = JSON.parse(output);
          console.log("Parsed Python output:", parsedOutput);
          
          return res.status(200).json({
            success: true,
            summary: parsedOutput.result, // Extract 'result' from the parsed JSON
          });
        } catch (parseError) {
          console.error("Error parsing Python output:", parseError);
          return res.status(500).json({
            success: false,
            message: "Error parsing Python output",
            error: parseError.message,
            rawOutput: output
          });
        }
      }
    });
    // Return successful response with the PDF URL
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "some error occured",
    });
  }
};
module.exports = { UploadPdfFile };
