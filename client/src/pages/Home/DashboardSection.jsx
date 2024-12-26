import React from 'react'

const DashboardSection = () => {
  return (
    <section  id="project-video"
    className="py-10 px-6 mt-[10%] max-md:h-auto rounded-md mb-6  shadow-md bg-gradient-to-tr from-indigo-950 via-violet-950  to-blue-900  " >
        <div className="container  max-md:h-auto  mx-auto flex max-md:flex-col gap-8 max-md:gap-6  max-md:justify-start h-screen  w-full justify-center items-center ">

        <div className="right-portion h-screen max-md:h-auto w-1/2 max-md:w-full flex max-md:items-start items-center justify-center  ">
        

                <img className='rounded-md max-md:w-full max-md:h-auto max-md:ml-0 ml-11 h-[50%]  ' src="/images/dashboard.png" alt="" />
        
            </div>

            <div className=" max-md:w-full gap-8 flex max-md:mx-2 flex-col max-md:justify-start justify-center mx-4 w-[60%] ">
                <h1 className='text-gray-200 max-md:text-3xl max-md:w-full  text-5xl mx-3' > Interactive Admin Dashboard for College Faculty </h1>
                <ul className='text-gray-200 max-md:mx-1 gap-4 flex flex-col  text-wrap mx-3' >
                    <li  > 💎 Role based Admin features</li>
                    <li className='max-md:hidden' > 💎 Add teachers and students in your Virtual College </li>
                    <li className='max-md:hidden' > 💎 Upload Assignment and Quizes for your Students </li>
                    <li className='max-md:hidden' > 💎 Manage your College Timetable and Announcements </li>
                    <li  > 💎 View and Download your College Reports </li>
                    <li> 💎 Go Live feature for teaching your Students </li>
                    {/* <li  > 💎 AI powered Smart Education System </li> */}

                </ul>
            </div>
            
            </div>
    </section>
  )
}

export default DashboardSection
