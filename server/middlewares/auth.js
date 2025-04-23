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
import jwt from "jsonwebtoken";
export  const authStudent = (req,res,next)=>{
  
    const {token} = req.headers;
    //console.log(token);
    if(!token){
        return res.status(401).json({
            success:false,
            message:"You are not authorized"
        })
    }
    try{
        const decodedData = jwt.verify(token,process.env.JWT_SECRET);
     //   console.log(decodedData);
        req.body.studentId = decodedData.userId;
        next();
    }
    catch(error){
       // console.log(error);
        return res.status(500).json({
            success:false,
            message:"Some error occured during authentication"
        })
    }
}