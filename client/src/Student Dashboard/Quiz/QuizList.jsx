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

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '../Layout/Layout';

// Quiz card component to keep main component clean
const QuizCard = ({ quiz, isActive, onToggle, onSubmit, userAnswers, setUserAnswers }) => {
  const handleAnswerChange = (questionId, selectedOption) => {
    setUserAnswers((prev) => ({
      ...prev,
      [quiz._id]: {
        ...prev[quiz._id],
        [questionId]: selectedOption,
      },
    }));
  };

  return (
    <div className="bg-white rounded-xl w-full   overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h2>
        <p className="text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {quiz.questions?.length || 0} Questions
          </span>
          <button
            onClick={() => onToggle(quiz._id)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200 flex items-center"
          >
            {isActive ? (
              <>
                Hide Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </>
            ) : (
              <>
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Questions Section */}
        {isActive && (
          <div className={`mt-4 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0'}`}>
            <div className="h-px bg-gray-200 mb-4"></div>
            
            {quiz.questions?.length > 0 ? (
              <form onSubmit={(e) => { e.preventDefault(); onSubmit(quiz._id); }}>
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={question._id} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-gray-800 font-medium mb-3">
                        <span className="inline-block w-6 h-6 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center mr-2">
                          {index + 1}
                        </span>
                        {question.questionText}
                      </h3>
                      <div className="ml-8 space-y-2">
                        {question.options.map((option, optIndex) => (
                          <label 
                            key={optIndex} 
                            className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question-${question._id}`}
                              value={optIndex}
                              onChange={() => handleAnswerChange(question._id, optIndex)}
                              checked={userAnswers[quiz._id]?.[question._id] === optIndex}
                              className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Submit Answers
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <p className="mt-2 text-gray-500">No questions available for this quiz.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('http://localhost:3001/api/quizzes');
        setQuizzes(res.data);
      } catch (error) {
        toast.error('Failed to fetch quizzes.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizzes();

    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      const newQuiz = JSON.parse(event.data);
      setQuizzes((prev) => [...prev, newQuiz]);
      toast.success('New quiz added!');
    };

    return () => ws.close();
  }, []);

  const handleQuizDetailsToggle = (quizId) => {
    setActiveQuiz(activeQuiz === quizId ? null : quizId);
  };

  const handleSubmitQuiz = async (quizId) => {
    try {
      const answers = userAnswers[quizId];
      if (!answers) {
        toast.warning('Please answer at least one question before submitting!');
        return;
      }
      
      await axios.post(`http://localhost:3001/api/quizzes/${quizId}/submit`, { answers });
      toast.success('Your answers have been submitted successfully!');
      
      // Reset active quiz after submission
      setActiveQuiz(null);
    } catch (error) {
      toast.error('Failed to submit your answers. Please try again.');
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Available Quizzes
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Test your knowledge with our interactive quizzes
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                isActive={activeQuiz === quiz._id}
                onToggle={handleQuizDetailsToggle}
                onSubmit={handleSubmitQuiz}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No quizzes found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search criteria." : "Check back later for new quizzes!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout()(QuizList);
