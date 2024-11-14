const Teacher = require('../models/teachersModels');


const addTeacher = async(req,res)=>{
    const {name,qualification,subject,experience}=req.body;

    try{
        const existingTeacher = await Teacher.findOne({name});
        if(existingTeacher){
            return res.status(400).json({
                success:false,
                error:"Teacher already exists"
            })
        }

        const teacher = await Teacher.create({
            name,
            qualification,
            subject,
            experience
        })

        return res.status(201).json({
            success:true,
            teacher,
            message:"Added teacher Successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:"Some error occured on adding teachers"
        })
    }
}

module.exports=addTeacher;