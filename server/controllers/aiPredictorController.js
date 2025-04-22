const {spawn} = require('child_process');


const AiPredictorController = async(req,res)=>{
    const {marks,attendance,branch}=req.body;

    console.log([marks,attendance,branch]);

    const pythonProcess = spawn("python",["../python_rec/pred_model.py",marks,attendance,branch]);

    let output = "";
    let errorOutput = "";


    pythonProcess.stdout.on("data",(data)=>{
        output+=data.toString();
       
    })

    pythonProcess.stderr.on("data",(data)=>{
        errorOutput+=data.toString();
       
    })

    pythonProcess.on("close",(code)=>{
        if(errorOutput){
            console.log("Some error occured",errorOutput)
        }

        else if( code !==0){
            return res.status(500).json({
                sucess:false,
                message:"failed to predict"
            })
        }
        else{
            try{

                const result = JSON.parse(output);
                console.log("result",result)
                return res.status(200).json({
                    success:true,
                    prediction:result,
                    message:"Prediction recieved from the model"
                })
            }catch(error){
                console.log("Internal server error",error);
                return res.status(500).json({
                    success: false,
                    message: "Internal Server Error",
                })
            }
        }
    })

    
}

module.exports=AiPredictorController;