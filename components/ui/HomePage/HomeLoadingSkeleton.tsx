export function HomeLoadingSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "1.5rem",
      }}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{ width: "100%", maxWidth: "320px", flex: "1 1 280px" }}
        >
          <div
            className="skeleton"
            style={{ height: "10rem", width: "100%", borderRadius: "var(--radius-card)" }}
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  )
}