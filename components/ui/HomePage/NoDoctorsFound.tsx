export function NoDoctorsFound() {
    return (
        <div
            className="card"
            style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "3rem" }}
        >
            No doctors found in the database.
        </div>
    )
}