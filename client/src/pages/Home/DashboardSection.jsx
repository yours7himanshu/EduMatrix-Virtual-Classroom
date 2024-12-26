import React from 'react'

const DashboardSection = () => {
  return (
    <section  id="project-video"
    className="py-10 px-6 mt-[10%] rounded-md mb-6 shadow-md bg-gradient-to-tr from-indigo-950 via-violet-950  to-blue-900  " >
        <div className="container mx-auto flex gap-8 h-screen w-full justify-center items-center ">

        <div className="right-portion h-screen w-1/2  flex items-center justify-center  ">
        

                <img className='rounded-md  ml-11 h-[50%]  ' src="/images/dashboard.png" alt="" />
        
            </div>

            <div className="left-portion gap-8 flex flex-col justify-center mx-4 w-[60%] ">
                <h1 className='text-gray-200 text-5xl mx-3' > Interactive Admin Dashboard for College Faculty </h1>
                <ul className='text-gray-200 flex flex-col text-xl mx-3' >
                    <li  > 💎 Role based Admin features</li>
                    <li  > 💎 Add teachers and students in your Virtual College </li>
                    <li  > 💎 Upload Assignment and Quizes for your Students </li>
                    <li  > 💎 Manage your College Timetable and Announcements </li>
                    <li  > 💎 View and Download your College Reports </li>
                    <li> 💎 Go Live feature for teaching your Students </li>
                    <li  > 💎 AI powered Smart Education System </li>

                </ul>
            </div>
            
            </div>
    </section>
  )
}

export default DashboardSection
