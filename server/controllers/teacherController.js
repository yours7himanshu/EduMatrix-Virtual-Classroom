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



const Teacher = require('../models/teachersModels');
const Admin = require('../models/adminModels');
const bcrypt = require('bcrypt');

const addTeacher = async(req,res)=>{
    const {name,qualification,subject,experience,email,password}=req.body;

    try{
        const existingTeacher = await Teacher.findOne({ email });
        if(existingTeacher){
            return res.status(400).json({
                success:false,
                message:"Teacher with this email already exists"
            })
        }
        const existingAdmin = await Admin.findOne({ email }).catch(() => null);
        if(existingAdmin){
            return res.status(400).json({
                success:false,
                message:"Teacher with this email already exists"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);
        const teacher = await Teacher.create({
            name,
            qualification,
            subject,
            experience,
            email,
            password:hashPassword
        })

        // Also create an authenticable Admin record with role: 'Teacher'
        const institutionId = req.user?.institutionId || null;
        await Admin.create({
            directorName: name,
            collegeName: req.user?.collegeName || "Faculty",
            centerCode: req.user?.centerCode || 0,
            email,
            password: hashPassword,
            role: 'Teacher',
            institutionId: institutionId,
        }).catch(() => null);

        return res.status(201).json({
            success:true,
            teacher,
            message:"Added teacher Successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Some error occured on adding teachers"
        })
    }
}

// function for displaying teachers

const teacherDetail = async(req,res)=>{
   try{
    const teacherDetail = await Teacher.find().select('-password');
    return res.status(200).json({
        success:true,
        teacherDetail,
        message:"Teacher detail successfully displayed"
    })
   }
   catch(error){
    return res.status(500).json({
        success:false,
        message:"Some error occured"
    })
   }

    
}

module.exports={addTeacher,teacherDetail};