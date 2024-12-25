import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null); // To track which quiz's details are shown
  const [userAnswers, setUserAnswers] = useState({}); // To store user answers

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/quizzes');
        setQuizzes(res.data);  // Axios response data is directly available in res.data
      } catch (error) {
        toast.error('Failed to fetch quizzes.', {
          
          autoClose: 3000,
        });
      }
    };
    fetchQuizzes();

    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      const newQuiz = JSON.parse(event.data);
      setQuizzes((prev) => [...prev, newQuiz]);
      toast.success('New quiz added!', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
    };

    return () => ws.close();
  }, []);

  const handleQuizDetailsToggle = (quizId) => {
    if (activeQuiz === quizId) {
      setActiveQuiz(null); // Close details if already open
    } else {
      setActiveQuiz(quizId); // Open the quiz details
    }
  };

  const handleAnswerChange = (quizId, questionId, selectedOption) => {
    setUserAnswers((prev) => ({
      ...prev,
      [quizId]: {
        ...prev[quizId],
        [questionId]: selectedOption,
      },
    }));
  };

  const handleSubmitQuiz = async (quizId) => {
    try {
      const answers = userAnswers[quizId]; // Get answers for the specific quiz
      if (!answers) {
        toast.error('Please answer all questions before submitting!', {
         
          autoClose: 3000,
        });
        return;
      }
      
      // Submit answers to backend (e.g., POST request to save answers)
      await axios.post(`http://localhost:3001/api/quizzes/${quizId}/submit`, { answers });
      toast.success('Your answers have been submitted!', {
        
        autoClose: 3000,
      });

      // Optionally, you can mark the quiz as solved or perform other actions
    } catch (error) {
      toast.error('Failed to submit your answers.', {
        
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Available Quizzes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-2xl font-semibold text-indigo-600 mb-4">{quiz.title}</h2>
              <p className="text-gray-700 mb-4">{quiz.description}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleQuizDetailsToggle(quiz._id)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none"
                >
                  {activeQuiz === quiz._id ? 'Hide Details' : 'View Details'}
                </button>
                <span className="text-sm text-gray-500">{quiz.questions?.length} Questions</span>
              </div>

              {/* Show questions if the quiz is active */}
              {activeQuiz === quiz._id && quiz.questions?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-800">Questions</h3>
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmitQuiz(quiz._id); }}>
                    <ul className="space-y-2">
                      {quiz.questions.map((question, index) => (
                        <li key={question._id} className="text-gray-600">
                          <div className="font-semibold">{index + 1}. {question.questionText}</div>
                          <ul className="ml-4 list-disc">
                            {question.options.map((option, optIndex) => (
                              <li key={optIndex} className="text-gray-500">
                                <label>
                                  <input
                                    type="radio"
                                    name={`question-${question._id}`}
                                    value={optIndex}
                                    onChange={() => handleAnswerChange(quiz._id, question._id, optIndex)}
                                    checked={userAnswers[quiz._id]?.[question._id] === optIndex}
                                    className="mr-2"
                                  />
                                  {option}
                                </label>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="submit"
                      className="mt-4 w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                    >
                      Submit Answers
                    </button>
                  </form>
                </div>
              )}

              {/* Show message if no questions available */}
              {activeQuiz === quiz._id && quiz.questions?.length === 0 && (
                <div className="mt-4 text-sm text-gray-500">No questions available for this quiz.</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizList;
