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

import {Link} from 'react-router-dom'
import React from 'react'
import { useLocation } from 'react-router-dom'; // Import useLocation
import './Footer.css'
import { Mail, Phone, MapPin} from 'lucide-react';



const Footer = () => {
  const location = useLocation(); // Get the current path using useLocation
  const isContactPage = location.pathname === '/contact'; // Check if the current path is "/contact"
  return (
    <footer className={isContactPage ? 'bg-indigo-950 text-white rounded-lg border/80 border-white-100 shadow-xl p-6 hover:shadow-md transition-shadow' :'bg-slate-950 text-gray-400 py-12'}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 max-md:gap-24 gap-36">
        <div>
          <div className="text-3xl max-md:text-2xl   flex items-center gap-2 font-extrabold">
                 <img className="rounded-full  h-10" src="/logo/EduMatrix2.png" alt="" />
                   <Link className='text-white' to="/">EduMatrix</Link>
                 </div>
                 <ul className="space-y-2 max-md:w-56 max-md:text-sm ">
                  <li className="flex items-center mt-4 space-x-2">
                    <Mail className="w-4  h-4 text-gray-400" />
                    <span className="text-gray-400 block ">support@edumatrix.com</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Phone className="w-4  h-4  text-gray-400" />
                    <span className="text-gray-400 block w-[100%] max-md:w-24">+91639886545</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 max-md:w-[100%]">123 Education Street, Tech Valley</span>
                  </li>
                </ul>
        </div>
       
        <div className='max-md:ml-5'>
          <h3 className="text-white font-semibold max-md:text-sm max-md:mt-3  mb-4">Resources</h3>
          <ul className="space-y-2 text-sm  ">
            <li><a href="#" className="hover:text-white ">Documentation</a></li>
            <li><a href="#" className="hover:text-white">Guides</a></li>
            <li><a href="#" className="hover:text-white">Support</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>
        <div className='max-md:ml-5' >
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Privacy</a></li>
            <li><a href="#" className="hover:text-white">Terms</a></li>
            <li><a href="#" className="hover:text-white">Security</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-12 pt-8 text-center">
        <p>&copy; 2024 EduMatrix. All rights reserved.</p>
      </div>
    </div>
  </footer>
  )
}

export default Footer
