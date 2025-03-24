
const mongoose = require('mongoose');


const feedbackSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }
})

const Feedback = mongoose.model('feedback',feedbackSchema);
module.exports = Feedback;