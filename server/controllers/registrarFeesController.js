const registrarFeesModel = require("../models/registrarFees");


const registrarFeesController = async(req,res)=>{
    const {RollNumber,Name,Fees,Fees_status,Branch} = req.body;

    try{
       
        const student = await registrarFeesModel.findOne({RollNumber});
        if(student){
            return res.status(500).json({
                success:false,
                message:"Student data already uploaded"
            })
        }

        const studentdetail = await registrarFeesModel.create({
            RollNumber,
            Name,
            Fees,
            Fees_status,
            Branch
        })

        return res.status(201).json({
            success: true,
            studentdetail,
            message: "Student data uploaded successfully",
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Some error occured on server side",
        })
    }
}



module.exports = registrarFeesController;