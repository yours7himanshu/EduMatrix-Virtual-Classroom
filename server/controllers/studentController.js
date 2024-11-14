const Student = require('../models/studentModels');

const enrollStudent = async(req,res)=>{
    const {name ,rollNo, branch,year,image}=req.body;

    try{
        const existingStudent = await Student.findOne({rollNo});
        if(existingStudent){
            return res.status(400).json({
                success:false,
                error:"Student already enrolled"
            })

        }
        
        const student = await Student.create({
            name,
            rollNo,
            branch,
            image,
            year
        });

        return res.status(201).json({
            success:true,
            student,
            message:"Student successfully enrolled"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:"Some error occured"
        })
    }
}

module.exports=enrollStudent;