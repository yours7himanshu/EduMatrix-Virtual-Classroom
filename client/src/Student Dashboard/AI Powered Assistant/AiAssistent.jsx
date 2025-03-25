// Copyright 2024 Himanshu Dinkar


/*
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
import axios from "axios";
import { toast } from "react-toastify";
import { FaSpinner } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Copy, SendHorizontal } from 'lucide-react';
import Layout from "../Layout/Layout";

const AiAssistent = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const formatResponse = (text) => {
    if (!text) return '';
    
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/#{3}\s+(.*)/g, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
      .replace(/#{2}\s+(.*)/g, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
      .replace(/#\s+(.*)/g, '<h1 class="text-3xl font-semibold mt-10 mb-5">$1</h1>')
      .replace(/\n/g, '<br />')
      .replace(/- (.*?)(<br \/>|$)/g, '<li class="ml-4 mb-2">$1</li>');

    formattedText = formattedText
      .split('<br /><br />')
      .map(paragraph => {
        if (paragraph.startsWith('<li')) {
          return `<ul class="list-disc pl-6 mb-4">${paragraph}</ul>`;
        }
        if (!paragraph.match(/^<h[1-3]|^<ul/)) {
          return `<p class="mb-4 leading-relaxed">${paragraph}</p>`;
        }
        return paragraph;
      })
      .join('');

    return DOMPurify.sanitize(formattedText);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/ai-assistent`, { input });
      if (response.data.success) {
        setOutput(response.data.output);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred while submitting your question");
      console.error("Error submitting question:", error);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b flex flex-col items-center w-[80%]  from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl border border-blue-200">
            <Brain className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            AI Classroom Assistant
          </h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            Your intelligent learning companion. Ask questions about your courses, assignments, or any academic topic.
          </p>
        </motion.div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg mb-8">
          {/* Response Display */}
          <AnimatePresence>
            {output && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-6 border-b border-gray-100"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-grow space-y-4">
                    <div 
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: formatResponse(output) }}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(output);
                        toast.success("Response copied to clipboard!");
                      }}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy response
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your question here..."
                className="w-full px-4 py-3 outline-none bg-gray-50 text-gray-900 rounded-xl
                  border border-gray-200 focus:border-blue-500 focus:ring-2 
                  focus:ring-blue-500 focus:ring-opacity-50 transition-all
                  placeholder-gray-400 resize-none"
                rows="3"
                disabled={loading}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className={`mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 
                rounded-xl font-medium text-white transition-all duration-200
                ${loading 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin w-5 h-5" />
                  <span>Processing your question...</span>
                </>
              ) : (
                <>
                  <SendHorizontal className="w-5 h-5" />
                  <span>Ask a Question</span>
                </>
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Layout()(AiAssistent);