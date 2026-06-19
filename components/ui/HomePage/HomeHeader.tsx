import Image from "next/image";

export function HomeHeader() {
    return (
        <header style={{ marginBottom: "3rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Image
                    src="/favicon.ico"
                    alt="Leonix-MedBase logo"
                    width={80}
                    height={80}
                    style={{ borderRadius: "16px", marginBottom: "1rem" }}
                />
                <h1
                    style={{
                        margin: 0,
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "var(--color-brand)",
                        letterSpacing: "-0.025em",
                        marginBottom: "0.5rem",
                    }}
                >
                    Leonix-MedBase
                </h1>
                <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--color-text-muted)" }}>
                    Select your profile and enter your PIN to continue.
                </p>
        </header>
    )}