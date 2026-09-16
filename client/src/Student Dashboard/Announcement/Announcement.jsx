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
import { Calendar, Inbox, Megaphone } from "lucide-react";
import {
  Badge,
  Button,
  FilterChips,
  PageHeader,
  SearchField,
  SkeletonRows,
} from "../Shared/ui";

const CATEGORIES = ["All", "Exam", "Event", "Holiday", "Assignment", "Lecture"];

const CATEGORY_TONE = {
  exam: "warn",
  event: "brand",
  holiday: "success",
  assignment: "danger",
  lecture: "outline",
};

function Announcement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const controller = new AbortController();
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/v3/displayAnnouncement`, {
          signal: controller.signal,
        });
        if (response.data.success) {
          setAnnouncements(response.data.getAnnouncement || []);
        }
      } catch (error) {
        if (error.response?.data?.message) {
          console.log(error.response.data.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();

    return () => {
      controller.abort();
    };
  }, [backendUrl]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (item.category &&
        item.category.toLowerCase() === selectedCategory.toLowerCase());
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.course && item.course.toLowerCase().includes(query)) ||
      (item.branch && item.branch.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const isFiltered = Boolean(searchQuery) || selectedCategory !== "All";

return (
    <div className="space-y-6">
      <PageHeader
        chip="NOTICES" chipLabel="Institute notice board"
        title="Announcements"
        description="Institute-wide notices, examination schedules and campus events curated for your semester."
        actions={
          <span className="text-[12.5px] font-semibold text-ink-500">
            {filteredAnnouncements.length} of {announcements.length} notices
          </span>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips
          options={CATEGORIES}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
        <SearchField
          className="w-full lg:w-72"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search notices, courses, branches"
        />
      </div>

      {loading ? (
        <SkeletonRows rows={4} />
      ) : filteredAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {filteredAnnouncements.map((item, index) => (
            <article
              key={item._id || index}
              className="rounded-2xl border border-ink-900/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(19,19,40,0.04)] transition-all duration-200 hover:border-ink-900/[0.14] hover:shadow-[0_2px_6px_rgba(19,19,40,0.05),0_18px_36px_-24px_rgba(19,19,40,0.3)] sm:p-6"
            >
              <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={CATEGORY_TONE[item.category?.toLowerCase()] || "neutral"}>
                    {item.category || "General"}
                  </Badge>
                  {item.course ? (
                    <span className="text-[12.5px] font-semibold text-ink-700">
                      {item.course}
                    </span>
                  ) : null}
                  {item.branch ? (
                    <span className="text-[12px] font-medium text-ink-400">
                      · {item.branch}
                    </span>
                  ) : null}
                </div>
                {item.date ? (
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-400">
                    <Calendar size={13} />
                    {formatDate(item.date)}
                  </span>
                ) : null}
              </header>

              <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-700">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-ink-900/[0.08] bg-white px-6 py-16 text-center shadow-[0_1px_2px_rgba(19,19,40,0.04)]">
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-ink-900/[0.08] bg-paper text-ink-500">
            <Inbox size={22} />
          </span>
          <h3 className="font-display text-[16px] font-bold text-ink-900">
            No announcements to show
          </h3>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-500">
            {isFiltered
              ? "Nothing matched this filter combination. Try another category or search term."
              : "There are no announcements published at the moment."}
          </p>
          {isFiltered ? (
            <Button
              className="mt-5"
              variant="subtle"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              <Megaphone size={14} />
              Reset filters
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default Layout()(Announcement);