const { spawn} = require('child_process');


const testFunction = (req,res)=>{
    const pythonProces = spawn('python', ['../python_rec/student_analysis.py'])

let output = ""
let errorOutput = "";


pythonProces.stdout.on("data",(data)=>{

    console.log(`output:${output}`)
    output += data.toString();
})


pythonProces.stderr.on("data",(data)=>{
    errorOutput += data.toString();
    console.log(`errorOutput:${errorOutput}`)
})

pythonProces.on("close",(code)=>{
    if(errorOutput){
        console.log("Some error occured from python side ",errorOutput);
    }
    if(code !==0){
        return res.status(500).json({
            success:false,
            message:"No code found"
        }) 
    }
    else{
        try{
            const result = JSON.parse(output);
            res.json({
                success:true,
                message:"image string base64 found",
                analysis:result
            })
            console.log(result);
        }catch(error){
         return res.status(500).json({
            success:false,
            message:"Error fetcing the analysis image"
         })
        }
    }
})
}

module.exports=testFunction