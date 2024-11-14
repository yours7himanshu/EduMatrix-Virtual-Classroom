const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    qualification:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    experience:{
     type:Number,
     required:true
    }
})

const Teacher = mongoose.model("teacher",teacherSchema);

module.exports=Teacher;