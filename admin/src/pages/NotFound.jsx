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
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4 py-12 font-sans">
      <div className="w-full max-w-lg">
        <h1 className="text-9xl font-bold text-red-600 drop-shadow-lg mb-2">404</h1>
        <h2 className="text-4xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto mb-10 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable. Please check the URL or navigate back to the dashboard.
        </p>
        <Link to="/dashboard" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300">
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
