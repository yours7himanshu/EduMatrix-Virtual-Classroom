import React from 'react'

const AuthSidebar = () => {
  return (
    <div className="w-[50%]  min-h-screen bg-gradient-to-r from-blue-600 to-violet-700 max-md:hidden   flex   flex-col items-center justify-center ">
    <div  className="flex flex-col items-center mt-10" >
      <h1 className="text-3xl w-[80%] text-center font-extrabold text-white  mb-1">
        Wanted to make Education Awesome??Let's Work together !!
      </h1>
      <img
        className="w-[60%] mt-8 "
        src="/images/virtual-classroom.png"
        alt="Illustration"
      />
    </div>

    <div className="text-white h-full flex justify-center items-center flex-col w-[90%] mb-11">
      <p className="text-yellow-200 text-sm text-center font-bold">
        Bridging the Gap Between Knowledge and Success. Learning Beyond
        Boundaries!!!!
      </p>
    </div>
  </div>
  )
}

export default AuthSidebar
