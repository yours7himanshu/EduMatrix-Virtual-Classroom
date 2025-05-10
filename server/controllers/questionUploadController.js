const cloudinary = require("cloudinary").v2;
const Notes = require('../models/notesModels');

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
    const notes = await Notes.create({
      notes: pdfUrl,
    });

    const pythonProcess = spawn("python", [
      "../python_rec/question_generation.py",
      pdfUrl,
    ]);
    pythonProcess.stdout.on("data", (data) => {
    
      output += data.toString();
    });
    pythonProcess.stderr.on("data", (data) => {
     
      errorOutput += data.toString();
    });
    pythonProcess.on("close", (code) => {

      if(errorOutput){
        console.log("Some error occured",errorOutput);
      }
     
      
      if (code !== 0) {
        return res.status(404).json({
          success: false,
          message: "No output recieved",
        });
      } else {
        try {
          const parsedOutput = JSON.parse(output);
          
          return res.status(200).json({
            success: true,
            summary: parsedOutput.result,
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
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "some error occured",
    });
  }
};
module.exports = { UploadPdfFile };
