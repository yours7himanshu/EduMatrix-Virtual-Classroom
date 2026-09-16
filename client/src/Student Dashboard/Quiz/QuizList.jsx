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

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../Layout/Layout";
import { useSocket } from "../../providers/Socket";
import {
  ChevronDown,
  ChevronUp,
  Inbox,
  Send,
} from "lucide-react";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  SearchField,
  SkeletonCards,
} from "../Shared/ui";

const QuizCard = ({ quiz, isActive, onToggle, onSubmit, userAnswers, setUserAnswers }) => {
  const answeredCount = Object.keys(userAnswers[quiz._id] || {}).length;
  const questionCount = quiz.questions?.length || 0;

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
    <Card className="flex flex-col overflow-hidden">
      <CardHeader
        title={quiz.title}
        description={quiz.description}
        action={
          <Badge tone="neutral">
            {questionCount} {questionCount === 1 ? "question" : "questions"}
          </Badge>
        }
      />

      <div className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
        <span className="text-[12px] font-medium text-ink-500">
          {isActive && questionCount > 0
            ? `${answeredCount} of ${questionCount} answered`
            : "Self-paced · instant evaluation"}
        </span>
        <button
          onClick={() => onToggle(quiz._id)}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-brand-600 transition-colors hover:text-brand-700"
        >
          {isActive ? "Hide questions" : "Start quiz"}
          {isActive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isActive ? (
        <div className="border-t border-ink-900/[0.08] bg-paper/50 px-5 py-5 sm:px-6">
          {questionCount > 0 ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit(quiz._id);
              }}
              className="space-y-5"
            >
              {quiz.questions.map((question, index) => (
                <fieldset key={question._id} className="space-y-2.5">
                  <legend className="flex items-start gap-2.5 text-[13.5px] font-semibold leading-snug text-ink-900">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-ink-900 text-[10.5px] font-bold text-white">
                      {index + 1}
                    </span>
                    {question.questionText}
                  </legend>

                  <div className="space-y-2 pl-[30px]">
                    {question.options.map((option, optIndex) => {
                      const checked = userAnswers[quiz._id]?.[question._id] === optIndex;
                      return (
                        <label
                          key={optIndex}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[12.5px] transition-all ${
                            checked
                              ? "border-brand-400 bg-brand-50 font-semibold text-ink-900"
                              : "border-ink-900/[0.08] bg-white font-medium text-ink-600 hover:border-ink-900/[0.16] hover:text-ink-900"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${quiz._id}-${question._id}`}
                            value={optIndex}
                            checked={checked}
                            onChange={() => handleAnswerChange(question._id, optIndex)}
                            className="h-3.5 w-3.5 accent-brand-600"
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-ink-900 text-[13px] font-semibold text-white transition-colors hover:bg-brand-600"
              >
                <Send size={14} />
                Submit answers
              </button>
            </form>
          ) : (
            <p className="py-4 text-center text-[12.5px] font-medium text-ink-400">
              No questions attached to this quiz yet.
            </p>
          )}
        </div>
      ) : null}
    </Card>
  );
};

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const backendApiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const socketContext = useSocket();
  const socket = socketContext?.socket;

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${backendApiUrl}/api/quizzes`);
        setQuizzes(res.data || []);
      } catch (error) {
        console.log("Failed to fetch quizzes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [backendApiUrl]);

  useEffect(() => {
    if (!socket) return;
    const handleNewQuiz = (newQuiz) => {
      setQuizzes((prev) => [...prev, newQuiz]);
      toast.success("New quiz available!");
    };

    socket.on("new-quiz", handleNewQuiz);
    return () => {
      socket.off("new-quiz", handleNewQuiz);
    };
  }, [socket]);

  const handleQuizDetailsToggle = (quizId) => {
    setActiveQuiz(activeQuiz === quizId ? null : quizId);
  };

  const handleSubmitQuiz = async (quizId) => {
    try {
      const answers = userAnswers[quizId];
      if (!answers || Object.keys(answers).length === 0) {
        toast.warning("Please answer at least one question before submitting!");
        return;
      }

      await axios.post(`${backendApiUrl}/api/quizzes/${quizId}/submit`, { answers });
      toast.success("Your answers have been submitted successfully!");
      setActiveQuiz(null);
    } catch {
      toast.error("Failed to submit your answers. Please try again.");
    }
  };

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQuestions = quizzes.reduce(
    (sum, quiz) => sum + (quiz.questions?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        chip="EVALUATION" chipLabel="Scored practice sets"
        title="Interactive quizzes"
        description="Practise with scored question sets and check your understanding before the next assessment."
        actions={
          <span className="text-[12.5px] font-semibold text-ink-500">
            {quizzes.length} quizzes · {totalQuestions} questions
          </span>
        }
      />

      <SearchField
        className="w-full sm:w-80"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search quizzes by title or topic"
      />

      {isLoading ? (
        <SkeletonCards count={3} />
      ) : filteredQuizzes.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
        <EmptyState
          icon={Inbox}
          title="No quizzes found"
          description={
            searchTerm
              ? "No quizzes matched this search. Try a different topic or course name."
              : "There are no quizzes published right now. Check back before your next assessment."
          }
        />
      )}
    </div>
  );
};

export default Layout()(QuizList);