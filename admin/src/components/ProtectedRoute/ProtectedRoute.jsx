import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const ProtectedRoute = ({element}) => {
    const {isAuthenticated} = useAuth();
    const navigate = useNavigate();

    return (
        <div>
            {isAuthenticated ? element : (
                <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="bg-indigo-600 px-4 py-5 sm:px-6 flex justify-center">
                            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V7a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3h6a3 3 0 003-3z" />
                            </svg>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-2xl leading-6 font-bold text-gray-900 text-center mb-4">
                                Access Restricted
                            </h3>
                            <div className="mt-2 text-center">
                                <p className="text-sm text-gray-500 mb-6">
                                    You need to be logged in with appropriate credentials to access this page.
                                </p>
                            </div>
                            <div className="mt-5 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                >
                                    Go to Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProtectedRoute
