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
    branch:{
        type:String,
        required:true
    },
    year:{
     type:String,
     required:true
    }
})

const Student = mongoose.model("student",studentSchema);
module.exports=Student;