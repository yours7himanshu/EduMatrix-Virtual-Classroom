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

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-semibold mb-4">Platform</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Features</a></li>
            <li><a href="#" className="hover:text-white">Solutions</a></li>
            <li><a href="#" className="hover:text-white">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Documentation</a></li>
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
        <div>
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
