const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async(req,res)=>{
    const {name ,username,email,password}=req.body;
    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
            error:"User already Exists"            })
        }

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password,salt);

      const user = await User.create({
        name,
        username,
        email,
        password:hashPassword
      });
      
      return res.status(201).json({
        success:true,
        user,
        message:"Account Successfully Created"
      })
    }
    catch(error){
        console.log("Some error occurred",error);
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }
}

const loginUser = async(req,res)=>{
    const {email,password}=req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                success:false,
                error:"User does not Exist.Please Sign Up"
            });
        }
        const isValidPassword = await bcrypt.compare(password,user.password);
        if(!isValidPassword){
            return res.status(401).json({
                success:false,
                error:"Invalid Credentials"
            });

        }
        const token = jwt.sign({email:email,userId:user._id},
            process.env.JWT_SECRET,
            {expiresIn:'1d'}
        )

        res.cookie("token",token,{
            httpOnly:true,
        });

        return res.status(200).json({
            success:true,
            token,
            message:"Login Successfull"
        })
    }catch(error){
        console.log("Some error occured",error);
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        });
    }
}

module.exports={register,loginUser};