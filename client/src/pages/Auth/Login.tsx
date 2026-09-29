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

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSpinner } from 'react-icons/fa';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [errors, setErrors] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors('');

    try {
      const response = await axios.post(`${backendUrl}/api/v1/login`, {
        email,
        password
      });

      if (response.data.success) {
        const userToken = response.data.token;
        setToken(userToken);
        localStorage.setItem('token', userToken);
        toast.success("Login Successful");
        navigate('/StudentDashboard/dashboard');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors(error.response?.data?.message);
        toast.error(error.response?.data?.message);
      } else {
        toast.error('An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-paper text-ink-900 relative overflow-hidden flex flex-col justify-between items-center px-4 sm:px-6 py-6 sm:py-10 antialiased selection:bg-brand-100 selection:text-brand-700">
      {/* ─── Ambient Glow Blobs & Dot-Grid (Matches Website Header) ─── */}
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
          to="/MainLogin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Switch role</span>
        </Link>
      </div>

      {/* ─── Auth Card ─── */}
      <div className="relative z-10 w-full max-w-md my-auto py-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl sm:rounded-[2.25rem] border border-ink-900/10 shadow-card p-5 sm:p-10">
          <div className="text-center mb-7">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink-900">
              Student Sign In
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              Enter your credentials to access your classroom
            </p>
          </div>

          {errors && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3.5 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700"
            >
              {errors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold uppercase tracking-wider text-ink-400 mb-1.5 ml-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 h-4 w-4" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  required
                  autoComplete="email"
                  inputMode="email"
                  className="w-full min-h-[48px] pl-11 pr-4 py-3 bg-paper border border-ink-900/15 rounded-2xl text-base text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-bold uppercase tracking-wider text-ink-400 mb-1.5 ml-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 h-4 w-4" aria-hidden="true" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full min-h-[48px] pl-11 pr-4 py-3 bg-paper border border-ink-900/15 rounded-2xl text-base text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 text-white font-bold py-3.5 px-6 text-sm shadow-soft hover:bg-brand-600 transition-all duration-200 active:scale-[0.99] disabled:opacity-60"
              >
                {loading ? (
                  <FaSpinner className="animate-spin h-4 w-4" aria-label="Signing in..." />
                ) : (
                  <>
                    <span>Sign In to Classroom</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-ink-900/[0.06] text-center">
            <p className="text-xs text-ink-500">
              Need an institutional account?{" "}
              <span className="text-brand-600 font-semibold block mt-1">
                Ask your college administrator for student access credentials.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-xs text-ink-400 text-center">
        © {new Date().getFullYear()} EduMatrix Virtual Classroom
      </footer>
    </div>
  );
};

export default Login;
