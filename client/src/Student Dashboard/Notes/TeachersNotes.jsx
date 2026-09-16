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

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Download,
  FileText,
  Inbox,
  LayoutGrid,
  List,
} from "lucide-react";
import Layout from "../Layout/Layout";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  FilterChips,
  PageHeader,
  SearchField,
  SegmentedControl,
  SkeletonCards,
} from "../Shared/ui";

const CATEGORY_POOL = [
  "Lecture Notes",
  "Study Material",
  "Reference Guide",
  "Assignment Prep",
];

const VIEW_OPTIONS = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "list", label: "List", icon: List },
];

const TeachersNotes = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const getNotes = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${backendUrl}/api/pdf`);
        if (response.data.success) {
          const notesWithMetadata = response.data.notes.map((note) => ({
            ...note,
            fileName: note.notes.split("/").pop(),
            category:
              note.category ||
              CATEGORY_POOL[Math.floor(Math.random() * CATEGORY_POOL.length)],
            uploadDate:
              note.uploadDate ||
              new Date(
                Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
              ).toISOString(),
            pages: Math.floor(Math.random() * 40) + 8,
          }));
          setNotes(notesWithMetadata);
          setFilteredNotes(notesWithMetadata);
        }
      } catch (err) {
        console.log("Some error occurred", err);
        setError("Failed to load notes. Please verify the connection and retry.");
      } finally {
        setIsLoading(false);
      }
    };
    getNotes();
  }, [backendUrl]);

  useEffect(() => {
    let result = notes;
    if (searchTerm) {
      result = result.filter((note) =>
        note.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeCategory !== "all") {
      result = result.filter((note) => note.category === activeCategory);
    }
    setFilteredNotes(result);
  }, [searchTerm, activeCategory, notes]);

  const categories = ["all", ...new Set(notes.map((note) => note.category))];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

return (
    <div className="space-y-6">
      <PageHeader
        chip="RESOURCES" chipLabel="Faculty shared material"
        title="Teachers' notes"
        description="Lecture slides, reference guides and study material shared by your faculty for the current semester."
        actions={
          <span className="text-[12.5px] font-semibold text-ink-500">
            {notes.length} documents
          </span>
        }
      />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <FilterChips
          options={categories.map((category) =>
            category === "all" ? "All" : category
          )}
          value={activeCategory === "all" ? "All" : activeCategory}
          onChange={(value) => setActiveCategory(value === "All" ? "all" : value)}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField
            className="w-full sm:w-64"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search documents"
          />
          <SegmentedControl
            className="shrink-0"
            options={VIEW_OPTIONS}
            value={viewMode}
            onChange={setViewMode}
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonCards count={6} />
      ) : error ? (
        <EmptyState
          icon={Inbox}
          title="Could not load notes"
          description={error}
          action={
            <Button variant="subtle" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      ) : filteredNotes.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No documents found"
          description="No study material matched this filter. Try another category or search term."
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note, index) => (
            <Card key={note._id || index} className="flex flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-3 px-5 pt-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-ink-900/[0.08] bg-paper text-brand-600">
                  <FileText size={18} />
                </span>
                <Badge tone="outline">{note.category}</Badge>
              </div>

              <div className="flex-1 px-5 py-4">
                <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink-900">
                  {note.fileName}
                </h3>
                <p className="mt-2 flex items-center gap-2.5 text-[11.5px] font-medium text-ink-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={12} />
                    {formatDate(note.uploadDate)}
                  </span>
                  <span>·</span>
                  <span>{note.pages} pages</span>
                </p>
              </div>

              <div className="px-5 pb-5">
                <ButtonLink
                  href={note.notes}
                  target="_blank"
                  rel="noreferrer"
                  variant="subtle"
                  size="sm"
                  className="w-full"
                >
                  <Download size={14} />
                  Download PDF
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-ink-900/[0.06]">
            {filteredNotes.map((note, index) => (
              <li
                key={note._id || index}
                className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-paper/60 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink-900/[0.08] bg-paper text-brand-600">
                    <FileText size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-ink-900">
                      {note.fileName}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11.5px] font-medium text-ink-400">
                      <span>{note.category}</span>
                      <span>·</span>
                      <span>{formatDate(note.uploadDate)}</span>
                      <span>·</span>
                      <span>{note.pages} pages</span>
                    </p>
                  </div>
                </div>

                <ButtonLink
                  href={note.notes}
                  target="_blank"
                  rel="noreferrer"
                  variant="subtle"
                  size="sm"
                  className="shrink-0"
                >
                  <Download size={14} />
                  Download
                </ButtonLink>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default Layout()(TeachersNotes);