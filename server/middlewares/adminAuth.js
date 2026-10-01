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


const jwt = require('jsonwebtoken')

const isAdminAuthenticated = (req,res,next)=>{
 try{
    const token =
      (req.cookies && req.cookies['token']) ||
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : req.headers?.token);

    if(!token){
        return res.status(401).json({
            success:false,
            message:"You are not authorized"
        });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decodedData.collegeId || decodedData.userId || decodedData.id,
      email: decodedData.email,
      role: decodedData.role,
      institutionId: decodedData.institutionId || decodedData.collegeId || null,
      name: decodedData.name,
    };
    next();
 }
 catch(error){
    return res.status(401).json({
        success:false,
        message:"Invalid or expired token"
    });
 }
}

module.exports=isAdminAuthenticated;