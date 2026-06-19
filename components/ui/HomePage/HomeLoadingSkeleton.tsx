export function HomeLoadingSkeleton() {
  return (
    <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: "10rem" }}
            aria-hidden="true"
          />
        ))}
      </div>
  )
}