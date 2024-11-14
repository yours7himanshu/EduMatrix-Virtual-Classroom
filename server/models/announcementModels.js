const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    course:{
        type:String,
        required:true
    },
    branch:{
        type:String,
        required:true
    },
    description:{
        type:String,
        requred:true
    }
});

const Assignment = mongoose.model("assignment",assignmentSchema);
module.exports=Assignment;