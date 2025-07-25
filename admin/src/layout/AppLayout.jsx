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
import Sidebar from '../shared/Sidebar'
import { RoleProvider } from "../context/RoleContext";


const AppLayout = () => (WrapLayoutComponent)=> {
    return (props)=>{
        return (
            <div  className='flex  h-screen w-screen max-md:justify-center ' >
              <RoleProvider>

              <Sidebar />
              </RoleProvider>
              <div className='w-full md:ml-[20%] h-screen overflow-x-hidden  ' >

              <WrapLayoutComponent {...props} />
              </div>
            </div>
          )
    }
 
}

export default AppLayout
