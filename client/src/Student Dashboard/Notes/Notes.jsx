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

import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  FilePlus,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import Layout from "../Layout/Layout";
import { Badge, Button, Card, CardHeader, PageHeader } from "../Shared/ui";

const renderInlineMarkdown = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={`bold-${index}`} className="font-bold text-ink-900">
          {boldMatch[1]}
        </strong>
      );
    }
    return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
  });
};

export const formatMarkdown = (text) => {
  if (!text) return null;
  return text
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className="mb-3 leading-relaxed text-ink-700">
        {renderInlineMarkdown(paragraph)}
      </p>
    ));
};

const Notes = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setFileName(file.name);
    } else {
      toast.error("Please select a valid PDF file");
      setPdfFile(null);
      setFileName("");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setFileName(file.name);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const resetFileSelection = () => {
    setPdfFile(null);
    setFileName("");
    setUploadProgress(0);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!pdfFile) {
      toast.error("Please upload a PDF file first");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const response = await axios.post(`${backendUrl}/api/summarize`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        toast.success("Summary generated successfully!");
        setSummary(response.data.summary);
        setShowSummary(true);
        resetFileSelection();
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.message || "An error occurred while uploading");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(summary)
      .then(() => {
        setCopied(true);
        toast.success("Summary copied to clipboard");
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => toast.error("Failed to copy summary"));
  };

return (
    <div className="space-y-6">
      <PageHeader
        chip="AI ENGINE" chipLabel="Document intelligence"
        title="PDF summarizer"
        description="Upload lecture notes, textbook chapters or problem sets and get the key concepts, formulas and practice questions extracted instantly."
        actions={<Badge tone="brand" icon={Sparkles}>Powered by EduMatrix AI</Badge>}
      />

      <Card className="overflow-hidden">
        <CardHeader
          title="Document workspace"
          description="Drop a PDF or select it from your device — maximum size 10 MB"
        />

        <div className="p-5 sm:p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all duration-200 sm:px-6 sm:py-12 ${
              pdfFile
                ? "border-emerald-300 bg-emerald-50/50"
                : dragActive
                  ? "border-brand-400 bg-brand-50/60"
                  : "border-ink-900/[0.12] bg-paper/60 hover:border-brand-400/60 hover:bg-paper"
            }`}
          >
            {!pdfFile ? (
              <div className="flex flex-col items-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-ink-900/[0.08] bg-white text-brand-600">
                  <Upload size={22} />
                </span>
                <p className="mt-4 font-display text-[15px] font-bold text-ink-900">
                  Drag your PDF here
                </p>
                <p className="mt-1 text-[12.5px] font-medium text-ink-500">
                  or browse from your device to pick a document
                </p>

                <label
                  htmlFor="file-upload"
                  className="mt-5 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-ink-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-600 active:scale-[0.99]"
                >
                  <FilePlus size={15} />
                  Select document
                </label>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={handleFileChange}
                />

                <p className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-400">
                  <AlertCircle size={13} />
                  Supported format: PDF documents up to 10 MB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-200 bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={22} />
                </span>
                <div className="mt-4 flex w-full max-w-md items-center gap-2.5 rounded-xl border border-ink-900/[0.08] bg-white px-3.5 py-2.5">
                  <FileText size={16} className="shrink-0 text-brand-600" />
                  <span className="min-w-0 flex-1 break-words text-[13px] font-semibold text-ink-900">
                    {fileName}
                  </span>
                  <button
                    onClick={resetFileSelection}
                    title="Remove file"
                    aria-label="Remove selected file"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-400 transition-colors hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                  >
                    <X size={17} />
                  </button>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 ? (
                  <div className="mt-5 w-full max-w-md space-y-2">
                    <div className="flex items-center justify-between text-[11.5px] font-bold text-ink-600">
                      <span>Uploading and parsing…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-900/[0.08]">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
<div className="mt-6 flex flex-col-reverse items-stretch gap-3 border-t border-ink-900/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Button
              variant="secondary"
              onClick={resetFileSelection}
              disabled={!pdfFile || loading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!pdfFile || loading}>
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Processing document…
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Generate summary
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {showSummary ? (
        <Card className="overflow-hidden">
          <CardHeader
            title="AI summary & review questions"
            description="Extracted key concepts, definitions and practice prompts"
            action={
              <Button variant="subtle" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    Copy
                  </>
                )}
              </Button>
            }
          />
          <div className="p-5 sm:p-6">
            <div className="prose max-w-none text-[13.5px] text-ink-700">{formatMarkdown(summary)}</div>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default Layout()(Notes);