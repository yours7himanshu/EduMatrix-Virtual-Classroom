const jwt = require('jsonwebtoken')

const isAdminAuthenticated = async(req,res,next)=>{
 try{
    const token = await  req.cookies['token'];

    if(!token){
        return res.status(401).json({
            success:false,
            message:"You are not authorized"
        })
    }

    const decodedData = await  jwt.verify(token,process.env.JWT_SECRET);
    console.log(decodedData);
 }
 catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"Some error occured during authentication"
    })
 }
 next();
}

module.exports=isAdminAuthenticated;