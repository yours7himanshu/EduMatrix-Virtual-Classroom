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


import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppLayout from '../../layout/AppLayout';


const CreateQuiz = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }],
  });

  const handleAddQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${backendUrl}/api/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quiz),
      });

      if (response.ok) {
        toast.success('Quiz created successfully!', {
          position: "top-right", // Use string directly here
          autoClose: 3000,
        });
        setQuiz({
          title: '',
          description: '',
          questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }],
        });
      } else {
        toast.error('Failed to create quiz. Please try again.', {
          position: "top-right", // Use string directly here
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error('An error occurred while creating the quiz.', {
        position: "top-right", // Use string directly here
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="w-full min-h-screen py-6 sm:py-10 px-3 sm:px-6 flex justify-center items-start bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl flex flex-col bg-white shadow-xl rounded-2xl p-4 sm:p-8 space-y-6 border border-gray-100"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left tracking-tight">Create a New Quiz</h2>

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
            Quiz Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter quiz title"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            className="border border-gray-300 p-2.5 sm:p-3 block w-full rounded-xl shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base outline-none transition"
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
            Quiz Description
          </label>
          <textarea
            id="description"
            placeholder="Enter quiz description"
            value={quiz.description}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            className="border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base border p-3 block w-full outline-none transition"
            rows={4}
            required
          ></textarea>
        </div>

        {/* Questions Section */}
        {quiz.questions.map((q, index) => (
          <div key={index} className="p-4 sm:p-5 bg-gray-50/80 border border-gray-200/80 rounded-2xl space-y-4">
            <label className="block text-sm font-bold text-gray-800">
              Question {index + 1}
            </label>
            <input
              type="text"
              placeholder="Enter question text"
              value={q.questionText}
              onChange={(e) =>
                setQuiz({
                  ...quiz,
                  questions: quiz.questions.map((q, i) =>
                    i === index ? { ...q, questionText: e.target.value } : q
                  ),
                })
              }
              className="block w-full border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base p-2.5 sm:p-3 outline-none bg-white transition"
              required
            />
            {/* Responsive grid for options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {q.options.map((option, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) =>
                    setQuiz({
                      ...quiz,
                      questions: quiz.questions.map((q, idx) =>
                        idx === index
                          ? { ...q, options: q.options.map((o, j) => (j === i ? e.target.value : o)) }
                          : q
                      ),
                    })
                  }
                  className="block w-full border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base p-2.5 outline-none bg-white transition"
                  required
                />
              ))}
            </div>
          </div>
        ))}

        {/* Action Buttons Section */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 border border-indigo-200 transition focus:outline-none text-sm sm:text-base"
          >
            + Add Another Question
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-md hover:shadow-lg transition focus:outline-none text-sm sm:text-base"
          >
            Create Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppLayout()(CreateQuiz);
