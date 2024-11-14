const express = require('express');
const connectDb = require('./db/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();
const announcementRoutes = require("./routes/announcementRoutes");
const teacherRoutes = require('./routes/teachersRoutes');
const studentRoutes = require('./routes/studentRoutes');


const app = express();


// connecting database string
connectDb();


// middlewares
app.use(cors());

// for form related parsing
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Setting my routes
app.use('/api/v1',userRoutes);
app.use('/api/v2',adminRoutes);
app.use('/api/v1',announcementRoutes);
app.use('/api/v1',teacherRoutes);
app.use('/api/v1',studentRoutes);



// for checking server is working or not
app.get('/',(req,res)=>{
    res.send("Welcome to my Server");
})



app.listen(process.env.PORT,()=>{
    console.log(`Sever is listening on port:${process.env.PORT}`);
})