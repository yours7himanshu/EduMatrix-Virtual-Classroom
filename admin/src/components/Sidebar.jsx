import { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
    const [activeItem, setActiveItem] = useState('dashboard');

    return (
        <div className="sidebar flex flex-col w-[20%] bg-blue-500 h-screen text-white">
            <ul className="flex mt-20 flex-col ml-10 gap-5">
                <Link to="/dashboard" >
                    <li className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${activeItem === 'dashboard' ? 'bg-white text-black border rounded-md' : 'text-white'}`} 
                        onClick={() => setActiveItem('dashboard')}
                    >
                        Dashboard
                    </li>
                </Link>
                <Link to="/add-teachers" >
                    <li className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${activeItem === 'teachers' ? 'bg-white text-black border rounded-md' : 'text-white'}`} 
                        onClick={() => setActiveItem('teachers')}
                    >
                        Add Teachers
                    </li>
                </Link>
                <Link to="enroll-students" >
                    <li className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${activeItem === 'students' ? 'bg-white text-black border rounded-md' : 'text-white'}`} 
                        onClick={() => setActiveItem('students')}
                    >
                        Enroll Students
                    </li>
                </Link>
                <Link to="/classes" >
                    <li className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${activeItem === 'classes' ? 'bg-white text-black border rounded-md' : 'text-white'}`} 
                        onClick={() => setActiveItem('classes')}
                    >
                        Assign Classes
                    </li>
                </Link>
                <Link to="/announcement" >
                    <li  className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${activeItem === 'announcement' ? 'bg-white text-black border rounded-md' : 'text-white'}`} 
                        onClick={() => setActiveItem('announcement')}
                    >
                        Announcement
                    </li>
                </Link>
                <Link to="/timetable" >
                    <li className={`list-style-none font-medium focus:bg-blue-400 p-3 w-[80%] ${activeItem === 'timetable' ? 'bg-white text-black border rounded-md' : 'text-white'}`} 
                        onClick={() => setActiveItem('timetable')}
                    >
                        Time Table
                    </li>
                </Link>
            </ul>
        </div>
    );
}

export default Sidebar;
