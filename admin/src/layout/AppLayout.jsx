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

const AppLayout = () => (WrapLayoutComponent) => {
    return (props) => {
        return (
            <RoleProvider>
              <div className='min-h-screen bg-gray-50 flex flex-col md:flex-row w-full overflow-x-hidden antialiased text-gray-900'>
                <Sidebar />
                <main className='flex-1 min-w-0 w-full min-h-screen md:pl-64 overflow-x-hidden flex flex-col'>
                  <WrapLayoutComponent {...props} />
                </main>
              </div>
            </RoleProvider>
          )
    }
}

export default AppLayout
