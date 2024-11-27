const mongoose = require('mongoose');


const studentSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    rollNo:{
        type:Number,
        required:true
    },
    fatherName:{
        type:String,
        required:true
    },
    phoneNo:{
        type:String,
        required:true
    },
    batch:{
        type:Number,
        required:true
    },
    branch:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:'student'
    }
})

const Student = mongoose.model("student",studentSchema);
module.exports=Student;