import { useState } from 'react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Login clicked')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-4">
        {/* Main Card */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          {/* Title */}
          <h1 className="text-3xl font-semibold text-center mb-8">
            Student Login
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
                placeholder="College ID or Email"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400"
                placeholder="Password"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded font-medium hover:bg-blue-600"
            >
              Log In
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Forgot Password */}
            <div className="text-center">
              <a href="#" className="text-sm text-blue-900">
                Forgot password?
              </a>
            </div>
          </form>
        </div>

        {/* Sign Up Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-center">
            Don't have an account?{' '}
            <a href="#" className="text-blue-500 font-semibold">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login