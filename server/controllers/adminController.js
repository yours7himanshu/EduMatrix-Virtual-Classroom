const Admin = require('../models/adminModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const collegeRegister = async(req,res)=>{
    const {directorName,collegeName,email,centerCode,password}=req.body;
    try{
        const existingCollege = await Admin.findOne({email});
        if(existingCollege){
            return res.status(400).json({
                success:false,
                error:"College Already Exists"
            })

        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);

        const college = await Admin.create({
            directorName,
            collegeName,
            email,
            centerCode,
            password:hashPassword
        })

        return res.status(201).json({
            success:true,
            college,
            message:"Your College is successfully registered"
        })

    }
    catch(error){

        return res.status(500).json({
            success:false,
            error:"Internal Sever error"
        })
    }
}

const collegeLogin = async(req,res)=>{
    const {email,password}=req.body;
    try{
        const college = await  Admin.findOne({email});
        if(!college){
            return res.status(400).json({
                success:false,
                error:"College does not exists",
            });

        }

        const isValidPassword = await bcrypt.compare(password,college.password);
        
        if(!isValidPassword){
            return res.status(400).json({
                success:"false",
                error:"Invalid Credentials"
            })

        }

       const token = jwt.sign({email:email,collegeId:college._id},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
       );

       res.cookie("token",token,{
        httpOnly:true
       })

       return res.status(200).json({
        success:true,
        token,
        message:"Login Successful"
       })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:"Internal Server error"
        })
    }
}

module.exports={collegeRegister,collegeLogin};