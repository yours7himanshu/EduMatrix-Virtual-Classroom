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

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { User, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";

function SignUp() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/v1/register`, {
        name,
        username,
        email,
        password,
      });
      if (response.data.success) {
        toast.success("Account successfully created!");
        navigate("/login");
      }
    } catch (error) {
      console.log("Error during registration", error);
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink-900 relative overflow-hidden flex flex-col justify-between items-center px-6 py-10 antialiased selection:bg-brand-100 selection:text-brand-700">
      {/* ─── Ambient Glow Blobs & Dot-Grid (Matches Header) ─── */}
      <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl pointer-events-none" />
      <div className="absolute top-10 -right-24 h-96 w-96 rounded-full bg-accent-lime/30 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-900 text-white shadow-soft transition-transform group-hover:scale-105">
            <span className="text-lg font-bold font-display">E</span>
          </span>
          <span className="text-base font-extrabold tracking-tight text-ink-900 font-display">
            EduMatrix
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Home</span>
        </Link>
      </div>

      {/* ─── Sign Up Card ─── */}
      <div className="relative z-10 w-full max-w-md my-auto py-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.25rem] border border-ink-900/10 shadow-card p-8 sm:p-10">
          <div className="text-center mb-6">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink-900">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              Start your virtual classroom journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-400 mb-1 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-paper border border-ink-900/15 rounded-2xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-400 mb-1 ml-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-paper border border-ink-900/15 rounded-2xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-400 mb-1 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 h-4 w-4" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-paper border border-ink-900/15 rounded-2xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-400 mb-1 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 h-4 w-4" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-paper border border-ink-900/15 rounded-2xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 text-white font-bold py-3.5 px-6 text-sm shadow-soft hover:bg-brand-600 transition-all duration-200 disabled:opacity-60"
              >
                <span>Create Account</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>

          <p className="mt-6 pt-5 border-t border-ink-900/[0.06] text-center text-xs text-ink-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-ink-900 underline underline-offset-4 decoration-brand-500 hover:text-brand-600"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-xs text-ink-400 text-center">
        © {new Date().getFullYear()} EduMatrix Virtual Classroom
      </footer>
    </div>
  );
}

export default SignUp;
