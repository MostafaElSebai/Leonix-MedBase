interface AlertProps {
  message: string;
}

export function Alert({ message }: AlertProps) {
  return (
    <div
      style={{
        backgroundColor: "#fee2e2",
        color: "var(--color-danger)",
        borderRadius: "var(--radius-card)",
        padding: "1.25rem 1.5rem",
        fontSize: "0.9375rem",
      }}
      role="alert"
    >
      <strong>Could not load doctors:</strong> {message}
    </div>
  );
}