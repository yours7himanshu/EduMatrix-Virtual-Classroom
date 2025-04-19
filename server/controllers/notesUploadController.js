const cloudinary = require('cloudinary').v2;


const UploadPdfFile = async(req,res)=>{

let pdfUrl;

if(!req.file){
    return res.status(404).json({
        success: false,
        message: "File not found"
    })

    
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

    pdfUrl = result.secure_url;
    
    // Return successful response with the PDF URL
    return res.status(200).json({
      success: true,
      message: "PDF file uploaded successfully",
      pdfUrl: pdfUrl
    });
    
  } catch (uploadError) {
    console.error("Error uploading avatar to Cloudinary:", uploadError);
    return res.status(500).json({
      success: false,
      message: "Error uploading pdf file",
      error: uploadError.message,
    });
  }


}

module.exports={UploadPdfFile}