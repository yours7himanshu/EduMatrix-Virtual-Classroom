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
              <div className='w-full h-screen overflow-x-hidden  ' >

              <WrapLayoutComponent {...props} />
              </div>
            </div>
          )
    }
 
}

export default AppLayout
