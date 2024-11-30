import React from 'react'
import Sidebar from '../shared/Sidebar'

const AppLayout = () => (WrapLayoutComponent)=> {
    return (props)=>{
        return (
            <div  className='flex  h-screen w-screen' >
              <Sidebar/>
              <div className='w-full h-screen overflow-x-hidden' >

              <WrapLayoutComponent {...props} />
              </div>
            </div>
          )
    }
 
}

export default AppLayout
