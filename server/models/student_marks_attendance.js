const mongoose = require('mongoose');


const studentMarksAttendanceSchema = new mongoose.Schema({
    RollNumber:{
        type:Number,
        required:true
    },
    Name:{
        type:String,
        required:true
    },
    Marks:{
        type:Number,
        required:true
    },
    Attendance:{
        type:Number,
        required:true
    },
    Section:{
        type:String,
        required:true
    },
    Year:{
        type:Number,
        required:true
    }
});

const StudentMarksAttendance = mongoose.model('StudentMarksAttendance', studentMarksAttendanceSchema);

module.exports = StudentMarksAttendance;