import Sidebar from "../components/Sidebar";
import Announcement from "./Announcement";

const Home = ()=>{

  return (
    <>
    <div className="home flex ">
        <Sidebar></Sidebar>
        <Announcement/>
      
    </div>
    </>
  )


}

export default Home;