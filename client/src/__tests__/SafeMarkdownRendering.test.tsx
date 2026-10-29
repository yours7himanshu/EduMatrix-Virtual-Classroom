import React from "react";
import { render, screen } from "@testing-library/react";
import { formatResponse } from "../Student Dashboard/AI Powered Assistant/AiAssistent";
import { formatMarkdown } from "../Student Dashboard/Notes/Notes";

describe("safe markdown rendering", () => {
  it("renders notes markdown as text and never injects script nodes", () => {
    const { container } = render(
      <div>{formatMarkdown("Hello\n\n**Important** <script>alert('x')</script>")}</div>
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText(/Important/)).toBeInTheDocument();
    expect(screen.getByText("<script>alert('x')</script>")).toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
  });

  it("renders assistant markdown structure without dangerous html injection", () => {
    const { container } = render(
      <div>{formatResponse("# Topic\n- first item\n<script>alert('x')</script>")}</div>
    );

    expect(screen.getByRole("heading", { level: 1, name: "Topic" })).toBeInTheDocument();
    expect(screen.getByRole("listitem", { name: "first item" })).toBeInTheDocument();
    expect(screen.getByText("<script>alert('x')</script>")).toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
  });
});
