// FeePayment.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const Payfees = () => {
  const [student, setStudent] = useState();
  const fees = {
    cse: 150000,
    ece: 140000,
    me: 130000,
    ce: 120000,
    it: 125000,
  };
  const handlePay = () => {
    const url = import.meta.env.VITE_BACKEND_URL + "/api/v10/payfees";
    const response = axios.post(url, {
      studentId: student._id,
      amount: fees[student.branch],
      rollno: student.rollno,
      email: student.email,
      year,
    });
    console.log(response);
    if (response.data.success) {
      const session_url = response.data.url;
      window.location.replace(session_url);
    }
  };
  const fetchStudent = async () => {
    try {
      const url = import.meta.env.VITE_BACKEND_URL + "/api/v5/student-byid";
      // console.log(localStorage.getItem("token"));
      const response = await axios.post(url, {
        headers: { token: localStorage.getItem("token") },
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchStudent();
  }, []);
  return <div>Payfees</div>;
};

export default Payfees;
