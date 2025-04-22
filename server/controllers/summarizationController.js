const {spawn}=require('child_process');
const cloudinary = require('cloudinary').v2;
const Notes = require('../models/notesModels');
let pdfUrl;
const Summarization = async(req,res)=>{

    
    let output = "";
    let errorOutput = "";

    try {
        if(!req.file){
            return res.status(404).json({
                success:false,
                message:"File not found"
            })
        }
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

         const pythonProcess = spawn("python",["../python_rec/text_summarization.py",pdfUrl]);
         pythonProcess.stdout.on("data",(data)=>{
            console.log(`output is ${output}`)
            output += data.toString()
         })

         pythonProcess.stderr.on("data",(data)=>{
            console.log(`errorOutput is ${errorOutput}`)
            errorOutput+=data.toString()
         })


         pythonProcess.on("close",(code)=>{
            if(errorOutput){
                console.log("Some error occured",errorOutput);
            }
            if(code !==0 ){
                return res.status(404).json({
                    success:false,
                    message:"No output recieved"
                })
            }
           const result = JSON.parse(output);
           console.log(result);
           return res.status(200).json({
            success:true,
            summary: result.result
           })
         })

        
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"some error occured"
        })
    }

}

const getPdf = async(req,res)=>{
  const notes = await Notes.find();
   return res.status(200).json({
      success:true,
      notes:notes
   })
}
      module.exports = {Summarization,getPdf};