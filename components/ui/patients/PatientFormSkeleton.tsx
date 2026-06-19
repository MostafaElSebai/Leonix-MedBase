export function PatientFormSkeleton() {
  return (
    <div
      style={{
        maxWidth: "56rem",
        margin: "0 auto",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      {[80, 100, 80, 80, 80, 100, 56, 56, 80].map((h, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: `${h}px`, borderRadius: "var(--radius-input)" }}
        />
      ))}
    </div>
  );
}
