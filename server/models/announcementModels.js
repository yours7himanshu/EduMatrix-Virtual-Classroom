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

const Announcement = mongoose.model("announcement",assignmentSchema);
module.exports=Announcement;