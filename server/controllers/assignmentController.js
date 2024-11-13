const Assignment = require('../models/assignment');


const assignment = async(req,res)=>{
    const {category,course,branch,descrition}=req.body;

    try{
        const assignment = await Assignment.create({
            category,
            course,
            branch,
            descrition

        })

        return res.status(201).json({
            success:true,
            assignment,
            message:"Assignment Successfully posted"
        })


    }catch(error){
        return res.status(500).json({
            success:false,
            error:"Error Posting the Assignment"
        })
    }
}

module.exports=assignment;