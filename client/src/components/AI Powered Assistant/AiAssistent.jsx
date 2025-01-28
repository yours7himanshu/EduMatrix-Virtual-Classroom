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
import SendIcon from '@mui/icons-material/Send';
import AssistantIcon from '@mui/icons-material/AssistantOutlined';
import { FaSpinner } from 'react-icons/fa';
import DOMPurify from 'dompurify';

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <AssistantIcon className="w-10 h-10 text-blue-600" />
            Classroom AI Assistant
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Ask me anything about your course material, assignments, or schedule
          </p>
        </div>

        {/* Response Container - Above Input */}
        {output && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200 animate-fade-in">
            <div className="flex items-start gap-3">
              <AssistantIcon className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1 min-w-0">
                <div 
                  className="text-gray-900 space-y-4"
                  dangerouslySetInnerHTML={{ __html: formatResponse(output) }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Input Form - Fixed at Bottom */}
        <form onSubmit={handleSubmit} className="sticky bottom-0 bg-gray-50 pt-4 space-y-6">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here..."
              className="w-full px-6 py-4 text-gray-900 bg-white rounded-xl shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 placeholder-gray-500"
              rows="3"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                Generating Response...
              </>
            ) : (
              <>
                <SendIcon className="w-5 h-5 mr-2" />
                Ask Question
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistent;