import React from 'react'
import { useEffect,useState } from 'react'
import axios from 'axios'

function StudentDetail() {
  const backendUrl=import.meta.env.VITE_BACKEND_URL;
  const [students,setStudents]=useState([]);

    useEffect(()=>{
        const fetchStudents = async()=>{
            try{
                const response = await axios.get(`${backendUrl}/api/v5/student-detail`);
                if(response.data.success){
                 setStudents(response.data.studentdetails);
                 console.log(response.data.studentdetails);
                }
            }
            catch(error){
                console.log("Error fetching the student details",error)
            }
        }
        fetchStudents();
    })

  return (
    <div>
      Testing Student Api
    </div>
  )
}

export default StudentDetail
