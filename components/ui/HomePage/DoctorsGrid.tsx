"use client";

import { Doctor, AuthStatus } from "@/app/types/index";
import { KioskCard } from "./KioskCard";
import { Button } from "./Button";
import { PinInput } from "./PinInput";
import { Badge } from "./Badge";

type DoctorsGridProps = {
  doctors: Doctor[];
  selectedId: string | number | null;
  authStatus: AuthStatus;
  pin: string;
  setPin: (value: string) => void;
  handleCardClick: (id: string | number, email: string) => void;
  verifyPin: (e?: React.FormEvent) => void;
  handleCancel: () => void;
};

export function DoctorsGrid({
  doctors,
  selectedId,
  authStatus,
  pin,
  setPin,
  handleCardClick,
  verifyPin,
  handleCancel,
}: DoctorsGridProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "1.5rem",
      }}
    >
      {doctors.map((doctor) => {
        const isSelected = selectedId === doctor.id;

        return (
          <div key={doctor.id} style={{ width: "100%", maxWidth: "320px", flex: "1 1 280px" }}>
          <KioskCard
            name={doctor.name || `Doctor #${doctor.id}`}
            subtitle={doctor.specialty}
            isSelected={isSelected}
            onClick={() => handleCardClick(doctor.id, doctor.email || '')}
          >
            {isSelected && (
              <form onSubmit={verifyPin}>
                <hr className="divider" style={{ marginBottom: "1rem" }} />

                <div style={{ marginBottom: "1rem" }}>
                  <p
                    style={{
                      margin: "0 0 0.75rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Enter your PIN
                  </p>
                  <PinInput
                    value={pin}
                    onChange={setPin}
                    onSubmit={() => verifyPin()}
                    error={authStatus === "error"}
                    autoFocus
                    disabled={authStatus === "loading" || authStatus === "success"}
                  />
                </div>

                {authStatus === "error" && (
                  <p
                    style={{
                      margin: "0 0 0.75rem",
                      fontSize: "0.8125rem",
                      color: "var(--color-danger)",
                    }}
                    role="alert"
                  >
                    Incorrect PIN. Please try again.
                  </p>
                )}

                {authStatus === "success" && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <Badge variant="success">
                      <svg
                        aria-hidden="true"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Authenticated successfully
                    </Badge>
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={authStatus === "loading"}
                    disabled={pin.length < 4 || authStatus === "success"}
                    style={{ flex: 1 }}
                  >
                    Authenticate
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </KioskCard>
          </div>
        );
      })}
    </div>
  );
}
