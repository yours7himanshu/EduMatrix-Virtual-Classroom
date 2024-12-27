/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


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
