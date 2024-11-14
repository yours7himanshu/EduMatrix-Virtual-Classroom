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
    image:{
        type:Array,
        required:true
    },
    
    year:{
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