const cloudinary = require('cloudinary').v2;

const {spawn} = require('child_process')
const UploadPdfFile = async(req,res)=>{

let pdfUrl;
let output = "";
let errorOutput = "";
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
    // for python script reading
    pdfUrl = result.secure_url;


    const pythonProcess = spawn('python', ['python_rec/text_summarization.py', pdfUrl]);
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    pythonProcess.on('close', (code) => {
      if(errorOutput){
        return res.status(500).json({
          success: false,
          message: "Error processing pdf file",
          
        })
      }
      
      if(code !==0){
        return res.status(404).json({
          success:false,
          message:"No output recieved"
        })
      }
      else {
      
          const result = JSON.parse(output);
          return res.status(200).json({
            success:true,
            result:result
            
            
        })

            
            
     
     }
    });
    // Return successful response with the PDF URL
  }catch(error){
return res.status(500).json ({
  success:false,
  message:"some error occured"
})

}
}
module.exports={UploadPdfFile}