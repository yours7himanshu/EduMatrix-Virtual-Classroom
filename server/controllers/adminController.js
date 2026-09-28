/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const Admin = require('../models/adminModels');
const Institution = require('../models/institutionModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const collegeRegister = async(req,res)=>{
    const {directorName,collegeName,email,centerCode,password,role}=req.body;
    try{
        const existingCollege = await Admin.findOne({email});
        const existingCollegeName = await Admin.findOne({collegeName});
        if(existingCollegeName){
            return res.status(409).json({
                success:false,
                message:" Your college is already registered with another id"
            });
        }
        if(existingCollege){
            return res.status(409).json({
                success:false,
                message:"Your college already exists"
            })

        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);

        // Find or create the institutional tenant
        let institution = await Institution.findOne({ name: collegeName });
        if (!institution) {
            institution = await Institution.create({
                name: collegeName,
                centerCode: Number(centerCode),
            });
        }

        const college = await Admin.create({
            directorName,
            collegeName,
            email,
            centerCode,
            role,
            password:hashPassword,
            institutionId: institution._id,
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
            message:"Internal Sever error"
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
                message:"College does not exists...Please Register",
            });

        }

        const isValidPassword = await bcrypt.compare(password,college.password);
        
        if(!isValidPassword){
            return res.status(400).json({
                success:"false",
                message:"Invalid Credentials"
            })

        }

       const institutionId = college.institutionId ? college.institutionId.toString() : college._id.toString();
       const token = jwt.sign(
         {
           email: email,
           collegeId: college._id,
           institutionId: institutionId,
           role: college.role,
           name: college.directorName || college.collegeName,
         },
         process.env.JWT_SECRET,
         { expiresIn: "24h" }
       );

       res.cookie("token",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV==="production"?true:false,
        sameSite:process.env.NODE_ENV==="production"?"none":"lax",
        // maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        path: '/', // Apply to all paths
        overwrite: true // Ensure it overwrites any existing token cookie
       })

       return res.status(200).json({
        success:true,
        token,
        institutionId,
        message:"Login Successful"
       })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server error"
        })
    }
}

const adminLogout = (req,res)=>{
    res.clearCookie("token",{
        httpOnly:true,
        secure:true,
        sameSite: 'None',
    })

    return res.status(200).json({
        success:true,
        message:"logout successful"
    })
}

module.exports={collegeRegister,collegeLogin,adminLogout};