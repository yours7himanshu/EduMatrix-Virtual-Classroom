import { useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";
const Announcement = () => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}/api/v1/assignment`, {
        category,
        description,
        course,
        branch,
      });
      if (response.data.success) {
        toast.success("Assignment posted Successful");
      }
    } catch (error) {
      console.log("Error posting assignments", error);
      toast.error("Error posting the assignments");
    }
  };
  return (
    <>
      <div className="announcement flex flex-col items-center w-full mt-20  ">
        <h1 className="font-bold text-3xl">
          Post Announcement for your college!!
        </h1>
        <form
          className="flex w-[40%] flex-col gap-4 mt-11 text-blue-500 rounded-md border border-gray-300 shadow-lg p-10"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder=" Enter Announcement Category"
            className="border border-gray-300 p-3 text-black w-full h-10"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <select
            className="border border-gray-300 text-black p-2 rounded h-10"
            value={course}
            onChange={(e)=>setCourse(e.target.value)}
            placeholder="Courses"
            name="Course"
            id=""
          >
            <option
             
              className="text-black"
              value=""
            >
              Please Select Your Course
            </option>

            <option className="text-black" value="B.Tech">
              B.tech
            </option>
            <option className="text-black" value="MBA">
              MBA
            </option>
            <option className="text-black" value="B.Sc">
              B.Sc
            </option>
            <option className="text-black" value="B.Pharma">
              B.Pharma
            </option>
          </select>

          <input
            type="text"
            placeholder="Branch"
            value={branch}
            onChange={(e) => {
              setBranch(e.target.value);
            }}
            className="border border-gray-300 h-10 p-2"
          />

          <textarea
            name="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            className="border border-gray-300 p-2"
            placeholder="Enter Announcement Description"
            rows="4"
            cols="50"
          ></textarea>

          <div className="button flex gap-2  justify-center">
            <button
              className="bg-green-600 hover:bg-green-500 w-[50%] text-white h-10 rounded-md"
              type="submit"
            >
              Post
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 p-2 w-[50%] rounded-md text-white ">
              Clear
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Announcement;
