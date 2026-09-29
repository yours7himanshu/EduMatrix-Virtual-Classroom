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

import React, { useEffect, useState, useRef, useCallback } from "react";
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
  Pagination,
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
          aria-expanded={isActive}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] font-bold text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700 active:scale-95"
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

                  <div className="space-y-2 sm:pl-[30px]">
                    {question.options.map((option, optIndex) => {
                      const checked = userAnswers[quiz._id]?.[question._id] === optIndex;
                      return (
                        <label
                          key={optIndex}
                          className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-[13.5px] transition-all active:scale-[0.99] ${
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
                            className="h-5 w-5 shrink-0 accent-brand-600"
                          />
                          <span className="min-w-0 break-words">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              <button
                type="submit"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-ink-900 text-sm font-semibold text-white transition-colors hover:bg-brand-600 active:scale-[0.99]"
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
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const backendApiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const socketContext = useSocket();
  const socket = socketContext?.socket;

  const lastSyncTimeRef = useRef(0);
  const lastProcessedCursorRef = useRef(null);
  const continuationCursorRef = useRef(null);
  const isSyncingRef = useRef(false);
  const seenQuizIds = useRef(new Set());

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
            token: token,
          },
          withCredentials: true,
        }
      : { withCredentials: true };
  };

  const MAX_PAGES_PER_SYNC = 10;
  const PAGE_LIMIT = 50;

  const syncQuizEvents = useCallback(async () => {
    // Avoid concurrent overlapping catch-up loops during rapid reconnects
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    try {
      let pageCount = 0;
      let hasMore = true;
      // Resume from continuation cursor if previous sync hit MAX_PAGES_PER_SYNC,
      // otherwise use the last acknowledged cursor, or fallback to since timestamp.
      let currentCursor = continuationCursorRef.current || lastProcessedCursorRef.current;
      const initialSince = !currentCursor && lastSyncTimeRef.current ? lastSyncTimeRef.current : 0;

      while (hasMore && pageCount < MAX_PAGES_PER_SYNC) {
        pageCount++;
        let url = `${backendApiUrl}/api/quizzes/events?limit=${PAGE_LIMIT}`;
        if (currentCursor) {
          url += `&cursor=${encodeURIComponent(currentCursor)}`;
        } else if (initialSince > 0) {
          url += `&since=${initialSince}`;
        }

        const res = await axios.get(url, getAuthHeaders());
        if (!res.data?.success || !Array.isArray(res.data.events)) {
          break;
        }

        const { events, pagination, serverTime } = res.data;
        if (serverTime) {
          lastSyncTimeRef.current = serverTime;
        }

        // Process this page of events and deduplicate against existing quizzes
        const newEvents = events.filter((evt) => {
          const quizId = evt.data?._id ? String(evt.data._id) : null;
          return quizId && !seenQuizIds.current.has(quizId);
        });

        if (newEvents.length > 0) {
          newEvents.forEach((evt) => seenQuizIds.current.add(String(evt.data._id)));
          setQuizzes((prev) => [...prev, ...newEvents.map((evt) => evt.data)]);
          toast.info(`${newEvents.length} new quiz${newEvents.length > 1 ? "zes" : ""} synchronized!`);
        }

        // Only advance cursor after successful processing of this page
        hasMore = Boolean(pagination?.hasMore && pagination?.nextCursor);
        if (pagination?.nextCursor) {
          currentCursor = pagination.nextCursor;
          lastProcessedCursorRef.current = pagination.nextCursor;
        } else {
          break;
        }
      }

      // If loop finished because page cap was hit and more remain, preserve continuation cursor
      if (hasMore && currentCursor) {
        continuationCursorRef.current = currentCursor;
      } else {
        continuationCursorRef.current = null;
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Session expired or unauthorized. Please log in again.");
      } else {
        console.warn("Quiz catch-up sync warning:", err?.message || err);
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, [backendApiUrl]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${backendApiUrl}/api/quizzes`, getAuthHeaders());
        const data = Array.isArray(res.data) ? res.data : [];
        setQuizzes(data);
        seenQuizIds.current = new Set(data.map((q) => String(q._id)));
        lastSyncTimeRef.current = Date.now();
        lastProcessedCursorRef.current = null;
        continuationCursorRef.current = null;
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error("Session expired or unauthorized. Please log in again.");
        } else {
          console.error("Failed to fetch quizzes:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [backendApiUrl]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      // Re-sync missed quiz events on socket connect/reconnect
      syncQuizEvents();
    };

    const handleNewQuiz = (newQuiz) => {
      if (!newQuiz || !newQuiz._id) return;
      const quizId = String(newQuiz._id);
      if (seenQuizIds.current.has(quizId)) return;

      seenQuizIds.current.add(quizId);
      setQuizzes((prev) => [...prev, newQuiz]);
      lastSyncTimeRef.current = Date.now();
      toast.success("New quiz available!");
    };

    socket.on("connect", handleConnect);
    socket.on("new-quiz", handleNewQuiz);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new-quiz", handleNewQuiz);
    };
  }, [socket, syncQuizEvents]);

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

      const res = await axios.post(
        `${backendApiUrl}/api/quizzes/${quizId}/submit`,
        { answers },
        getAuthHeaders()
      );
      if (res.data?.success) {
        toast.success(`Your answers have been submitted! Score: ${res.data.score}/${res.data.totalQuestions}`);
      } else {
        toast.success("Your answers have been submitted successfully!");
      }
      setActiveQuiz(null);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Unauthorized or session expired. Please re-authenticate.");
      } else {
        toast.error("Failed to submit your answers. Please try again.");
      }
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

  // Reset to the first page whenever the result set changes.
  useEffect(() => {
    setPage(1);
  }, [searchTerm, quizzes.length]);

  const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleQuizzes = filteredQuizzes.slice(start, start + PAGE_SIZE);

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
        <>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleQuizzes.map((quiz) => (
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
        <div className="pt-1">
          <p className="mb-3 text-center text-[12.5px] font-semibold text-ink-500">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, filteredQuizzes.length)} of {filteredQuizzes.length} quizzes
          </p>
          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
        </>
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