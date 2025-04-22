const StudentMarksAttendance = require('../models/student_marks_attendance');


const StudentMarksController = async(req,res)=>{
    const { RollNumber, Name, Marks, Attendance, Year, Section } = req.body;
    try{

        const student = await StudentMarksAttendance.findOne({RollNumber});
        if(student){
            return res.status(500).json({
                success:false,
                message:"Student data already uploaded"
            })
        }

        const studentdetail = await StudentMarksAttendance.create({
            RollNumber,
            Name,
            Marks,
            Attendance,
            Year,
            Section
        })

        return res.status(201).json({
            success: true,
            studentdetail,
            message: "Student data uploaded successfully",
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Some error occured on server side",
        })
    }
};
            

module.exports=StudentMarksController;