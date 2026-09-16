import React from "react";
import { Book, Bookmark, User } from "lucide-react";
import { Badge, EmptyState, SearchField } from "../../Student Dashboard/Shared/ui";

const BookList = ({ books, searchTerm, setSearchTerm }) => (
  <div className="space-y-5">
    <SearchField
      className="w-full sm:w-80"
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
      placeholder="Search by title, author or discipline"
    />

    {books.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    ) : (
      <EmptyState
        icon={Book}
        title="No books found"
        description="Try another title, author or discipline to find the material you need."
      />
    )}
  </div>
);

const BookCard = ({ book }) => (
  <article className="flex overflow-hidden rounded-2xl border border-ink-900/[0.08] bg-white transition-all duration-200 hover:border-ink-900/[0.14] hover:shadow-[0_2px_6px_rgba(19,19,40,0.05),0_18px_36px_-24px_rgba(19,19,40,0.3)]">
    <div
      className={`flex w-20 shrink-0 flex-col items-center justify-center gap-2 border-r border-ink-900/[0.06] ${
        book.coverColor || "bg-brand-50"
      }`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/80 text-brand-700">
        <Book size={17} />
      </span>
      <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-ink-500">
        {book.publishedYear}
      </span>
    </div>

    <div className="flex min-w-0 flex-1 flex-col justify-between px-4 py-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400">
            {book.category}
          </p>
          <Badge tone={book.available ? "success" : "warn"}>
            {book.available ? "Available" : "Borrowed"}
          </Badge>
        </div>

        <h3 className="mt-2 text-[14px] font-semibold leading-snug text-ink-900">
          {book.title}
        </h3>
        <p className="mt-0.5 text-[12px] font-medium text-ink-500">
          by {book.author}
        </p>
      </div>

      {!book.available && book.borrowedBy ? (
        <p className="mt-3 flex items-center gap-1.5 border-t border-ink-900/[0.06] pt-2.5 text-[11.5px] font-medium text-ink-500">
          <User size={12} className="text-ink-400" />
          Reserved by
          <span className="font-semibold text-ink-800">{book.borrowedBy}</span>
        </p>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 border-t border-ink-900/[0.06] pt-2.5 text-[11.5px] font-medium text-ink-400">
          <Bookmark size={12} />
          Ready to reserve
        </p>
      )}
    </div>
  </article>
);

export default BookList;