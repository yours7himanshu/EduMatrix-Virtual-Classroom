import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";



const AIPredictor = () => {
  const [marks, setMarks] = useState("");
  const [attendance, setAttendance] = useState("");
  const [branch, setBranch] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async(e)=>{
    e.preventDefault();

    try{

        const response = await axios.post(`${backendUrl}/api/v9/aiPredictor`,{
            marks,
            attendance,
            branch
        })

        if(response.data.success){
            toast.success("Prediction successful!");
            console.log(response.data);
        }

    }catch(error){
        toast.error(error.response?.data?.message)
        console.log("Some error occured",error);
    }
  }
  return (
    <div>
      <form onSubmit={handleSubmit} action="">
      <input type="number"
      placeholder="Enter Marks of the Student"
      value={marks}
      onChange={(e)=>setMarks(e.target.value)}
      required
      />

      <input type="text"
      placeholder="Enter branch of the Student"
      value={branch}
      onChange={(e)=>setBranch(e.target.value)}
      required
      />
       <input type="number"
      placeholder="Enter Attendance of the Student"
      value={attendance}
      onChange={(e)=>setAttendance(e.target.value)}
      required
      />
      <button type="submit">Predict</button>
      </form>
    </div>
  );
};
 

export default AIPredictor;
