interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPrev,
  onNext,
  onFirst,
  onLast,
}: PaginationProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}
    >
      {/* Count summary */}
      <p
        style={{
          margin: 0,
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
        }}
      >
        Showing{" "}
        <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
          {start}–{end}
        </span>{" "}
        of{" "}
        <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
          {totalCount}
        </span>{" "}
        patients
      </p>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onFirst}
          disabled={currentPage === 1}
          aria-label="Go to first page"
        >
          First
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onPrev}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          style={{ gap: "0.375rem" }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Prev</span>
        </button>

        <span
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-muted)",
            whiteSpace: "nowrap",
            margin: "0 0.25rem",
          }}
        >
          Page{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>{currentPage}</strong>
          {" "}of{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>{totalPages}</strong>
        </span>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onNext}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          style={{ gap: "0.375rem" }}
        >
          <span>Next</span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onLast}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
        >
          Last
        </button>
      </div>
    </div>
  );
}
