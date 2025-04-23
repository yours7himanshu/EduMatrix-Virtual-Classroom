const Feedback = require('../models/feedbackModels')


const feedbackController = async(req,res)=>{
    const {fullName,email,description}=req.body;

    try{
        const feedback = await Feedback.create({
            fullName,
            email,
            description
        });

        return res.status(201).json({
            success:true,
            feedback,
            message:"Feedback successfully sent"
        })
    }
    catch(error){
        console.log("Some error occured on sending feedback",error);
        return res.status(500).json({
            success:false,
            message : "Some error occured on sending feedback"
        })
    }
}


const getFeedback = async(req,res)=>{
  try{
    const feedbackreport = await Feedback.find();
    return res.status(200).json({
        success:true,
        feedbackreport
    })
  } catch(error){
    return res.status(500).json({
        success:false,
        message:"Cannot able to fetch the feedbacks"
    })
  }
}

module.exports = {feedbackController,getFeedback};