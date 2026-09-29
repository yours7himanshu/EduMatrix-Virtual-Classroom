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
import axios from "axios";
import Layout from "../Layout/Layout";
import { CalendarClock, Download, Inbox, Paperclip } from "lucide-react";
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
  SearchField,
  SkeletonCards,
} from "../Shared/ui";

type Assignment = {
  _id: string;
  title: string;
  description: string;
  questions: string;
  deadline: string;
  pdfUrl: string;
};

/* Deadline urgency: red under a day, amber within three days, neutral beyond. */
const deadlineMeta = (deadline: string) => {
  const due = new Date(deadline);
  const days = Math.ceil((due.getTime() - Date.now()) / 86400000);
  const label = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days < 1)
    return { tone: "danger" as const, text: `Due today · ${label}` };
  if (days === 1) return { tone: "warn" as const, text: `Due tomorrow · ${label}` };
  if (days <= 3)
    return { tone: "warn" as const, text: `Due in ${days} days · ${label}` };
  return { tone: "neutral" as const, text: `Due ${label}` };
};

const Assignment: React.FC = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/v7/getAssignment`);
        if (response.data.success) {
          setAssignments(response.data.studentAssignment || []);
        }
      } catch (error) {
        console.log("Some error occurred fetching assignments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [backendUrl]);

  const filtered = assignments.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        chip="COURSEWORK" chipLabel="Submission tracker"
        title="Assignments"
        description="Download question sheets, track submission windows and keep every deadline in one place."
        actions={
          <span className="text-[12.5px] font-semibold text-ink-500">
            {filtered.length} of {assignments.length} assignments
          </span>
        }
      />

      <SearchField
        className="w-full sm:w-80"
        value={searchQuery}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setSearchQuery(event.target.value)
        }
        placeholder="Search assignments by title or topic"
      />

      {loading ? (
        <SkeletonCards count={3} />
      ) : filtered.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((assignment) => {
            const meta = deadlineMeta(assignment.deadline);
            return (
              <Card key={assignment._id} className="flex flex-col overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 border-b border-ink-900/[0.08] px-4 py-3 sm:px-5 sm:py-3.5">
                  <Badge tone="neutral" icon={Paperclip}>
                    {assignment.questions
                      ? `${assignment.questions} questions`
                      : "Problem sheet"}
                  </Badge>
                  <Badge tone={meta.tone} icon={CalendarClock}>
                    {meta.text}
                  </Badge>
                </div>

                <div className="flex-1 px-5 py-5">
                  <h3 className="font-display text-[15px] font-bold leading-snug text-ink-900">
                    {assignment.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-500">
                    {assignment.description}
                  </p>
                </div>

                <div className="px-5 pb-5">
                  {assignment.pdfUrl ? (
                    <ButtonLink
                      href={assignment.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      variant="primary"
                      className="w-full"
                    >
                      <Download size={15} />
                      Download question sheet
                    </ButtonLink>
                  ) : (
                    <p className="rounded-full border border-ink-900/[0.08] bg-paper py-2.5 text-center text-[12.5px] font-semibold text-ink-400">
                      No file attached yet
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No assignments available"
          description={
            searchQuery
              ? "No assignments matched this search. Try a different keyword."
              : "There are currently no assignments posted for your cohort."
          }
        />
      )}
    </div>
  );
};

export default Layout()(Assignment);