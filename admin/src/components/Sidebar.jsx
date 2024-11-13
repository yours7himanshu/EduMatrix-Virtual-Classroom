import { Link } from "react-router-dom";
const Sidebar = ()=>{

return (
    <>
    <div className="sidebar flex flex-col w-[20%]  bg-blue-500 h-screen text-white  ">
        <ul className="flex mt-20 flex-col ml-10 gap-5 " >
           <Link><li className="list-style-none font-medium focus:bg-blue-400 hover:bg-white hover:text-black p-2 w-[80%] " >Dashboard</li></Link> 
            <Link><li className="list-style-none font-medium focus:bg-blue-400 hover:bg-white hover:text-black p-2 w-[80%] " >Add Teachers</li></Link>
            <Link><li className="list-style-none font-medium focus:bg-blue-400 hover:bg-white hover:text-black p-2 w-[80%] " >Enroll Students</li></Link>
            <Link><li className="list-style-none font-medium focus:bg-blue-400 hover:bg-white hover:text-black p-2 w-[80%] " >Assign Classes</li></Link>
            <Link><li className="list-style-none font-medium focus:bg-blue-400 hover:bg-white hover:text-black p-2 w-[80%] " >Announcement</li></Link>
            <Link><li className="list-style-none font-medium focus:bg-blue-400 hover:bg-white hover:text-black p-2 w-[80%] " >Time Table</li></Link>


            </ul>
    </div>
    </>
    
)
}

export default Sidebar;