const Assignment = require('../models/announcementModels');


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


const displayAnnoncement = async(req,res)=>{
    try{
        const display = await Announcement.find();

    return res.status(200).json({
        success:true,
        display,
        message:"Announcement Successfully displayed"
    })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:"Some error occured"
        })
    }
}

module.exports={assignment,displayAnnoncement};