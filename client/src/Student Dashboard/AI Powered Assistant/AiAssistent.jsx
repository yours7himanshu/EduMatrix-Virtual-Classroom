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
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  Copy,
  CornerDownLeft,
  Loader2,
  SendHorizontal,
  Sparkles,
} from "lucide-react";
import Layout from "../Layout/Layout";
import { Badge, Card, CardHeader, PageHeader } from "../Shared/ui";

const SUGGESTED_PROMPTS = [
  "Explain Big-O notation with simple code examples",
  "Derive Maxwell's equations and their physical meaning",
  "How does Dijkstra's shortest path algorithm work?",
  "Give me 5 practice questions on differential calculus",
];

const renderInlineMarkdown = (text) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={`bold-${index}`} className="font-bold text-ink-900">
          {boldMatch[1]}
        </strong>
      );
    }

    const italicMatch = part.match(/^\*(.*?)\*$/);
    if (italicMatch) {
      return (
        <em key={`italic-${index}`} className="italic text-ink-800">
          {italicMatch[1]}
        </em>
      );
    }

    return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
  });
};

export const formatResponse = (text) => {
  if (!text) return null;

  const elements = [];
  const lines = text.split("\n");
  let paragraphLines = [];
  let listItems = [];
  let keyIndex = 0;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    elements.push(
      <p key={`p-${keyIndex++}`} className="mb-3.5 leading-relaxed">
        {paragraphLines.map((line, index) => (
          <React.Fragment key={`line-${index}`}>
            {index > 0 ? <br /> : null}
            {renderInlineMarkdown(line)}
          </React.Fragment>
        ))}
      </p>
    );
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`ul-${keyIndex++}`} className="list-disc pl-5 mb-4 space-y-1">
        {listItems.map((item, index) => (
          <li key={`li-${index}`} className="ml-4 mb-1.5 text-ink-700">
            {renderInlineMarkdown(item)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const heading3 = trimmed.match(/^###\s+(.*)$/);
    const heading2 = trimmed.match(/^##\s+(.*)$/);
    const heading1 = trimmed.match(/^#\s+(.*)$/);
    const bullet = trimmed.match(/^-\s+(.*)$/);

    if (heading3) {
      flushParagraph();
      flushList();
      elements.push(
        <h3
          key={`h3-${keyIndex++}`}
          className="font-display text-[15px] font-bold text-ink-900 mt-5 mb-2"
        >
          {renderInlineMarkdown(heading3[1])}
        </h3>
      );
      return;
    }

    if (heading2) {
      flushParagraph();
      flushList();
      elements.push(
        <h2
          key={`h2-${keyIndex++}`}
          className="font-display text-[17px] font-bold text-ink-900 mt-6 mb-3"
        >
          {renderInlineMarkdown(heading2[1])}
        </h2>
      );
      return;
    }

    if (heading1) {
      flushParagraph();
      flushList();
      elements.push(
        <h1
          key={`h1-${keyIndex++}`}
          className="font-display text-[19px] font-extrabold text-ink-900 mt-7 mb-3"
        >
          {renderInlineMarkdown(heading1[1])}
        </h1>
      );
      return;
    }

    if (bullet) {
      flushParagraph();
      listItems.push(bullet[1]);
      return;
    }

    flushList();
    paragraphLines.push(trimmed);
  });

  flushParagraph();
  flushList();
  return elements;
};

const AiAssistent = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    if (!input.trim()) return;
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/ai-assistent`, { input });
      if (response.data.success) {
        setOutput(response.data.output);
        toast.success(response.data.message || "Insight generated!");
      } else {
        toast.error(response.data.message || "Failed to generate response.");
      }
    } catch (error) {
      toast.error("An error occurred while submitting your question");
      console.error("Error submitting question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard
      .writeText(output)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => toast.error("Could not copy the response"));
  };

return (
    <div className="space-y-6">
      <PageHeader
        chip="AI ENGINE" chipLabel="Grounded in your syllabus"
        title="Study copilot"
        description="Ask about your coursework, homework or research topics — answers are grounded in your semester syllabus."
        actions={<Badge tone="brand" icon={Sparkles}>EduMatrix AI</Badge>}
      />

      <Card className="overflow-hidden">
        <CardHeader
          title="Conversation"
          description="Ask a question below, or start from one of the suggested prompts"
        />

        <div className="p-5 sm:p-6">
          {/* Suggested prompts */}
          <div className="flex flex-wrap gap-2 pb-1">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="min-h-[44px] rounded-full border border-ink-900/[0.10] bg-white px-4 py-2 text-left text-[13px] font-medium leading-snug text-ink-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-[0.99]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Response */}
          {output ? (
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-5 overflow-hidden rounded-2xl border border-ink-900/[0.08] bg-white"
            >
              <header className="flex items-center justify-between gap-3 border-b border-ink-900/[0.08] bg-paper/60 px-4 py-3">
                <span className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-white">
                    <Bot size={14} />
                  </span>
                  <span className="text-[12.5px] font-bold text-ink-900">
                    EduMatrix response
                  </span>
                </span>

                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/[0.10] bg-white px-3 py-1.5 text-[11.5px] font-bold text-ink-600 transition-colors hover:border-ink-900/20 hover:text-ink-900"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy
                    </>
                  )}
                </button>
              </header>

              <div className="prose max-w-none break-words px-4 py-4 text-sm leading-relaxed text-ink-700 sm:px-5 sm:text-[13.5px] [&_a]:break-all [&_code]:break-all [&_img]:h-auto [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto">
                {formatResponse(output)}
              </div>
            </motion.article>
          ) : null}

          {/* Composer */}
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="rounded-2xl border border-ink-900/[0.10] bg-white transition-all focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit();
                  }
                }}
                rows={2}
                disabled={loading}
                placeholder="Ask anything about your courses, homework or research topics…"
                aria-label="Ask the AI assistant"
                className="max-h-[38dvh] w-full resize-none rounded-2xl bg-transparent px-4 py-3.5 text-base text-ink-900 outline-none placeholder:text-ink-400 sm:text-[13.5px]"
              />

              <div className="flex items-center justify-end gap-3 border-t border-ink-900/[0.06] px-3 py-2.5 sm:justify-between sm:px-4">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-400">
                  <CornerDownLeft size={13} />
                  Enter to send · Shift + Enter for a new line
                </span>

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Thinking…
                    </>
                  ) : (
                    <>
                      Send
                      <SendHorizontal size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Layout()(AiAssistent);