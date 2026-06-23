import { VisitFormData } from "@/components/ui/visits";
import { formatDate } from "@/lib/utils";

interface VisitViewCardProps {
  data: Partial<VisitFormData>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-brand)", marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
        {title}
      </h3>
      <div style={{ display: "grid", gap: "1.25rem" }}>{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.375rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", whiteSpace: "pre-wrap", backgroundColor: "var(--color-bg-card)", padding: "0.75rem", borderRadius: "var(--radius-input)", border: "1px solid var(--color-border)", minHeight: "2.5rem" }}>
        {value || <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Not provided</span>}
      </div>
    </div>
  );
}

export function VisitViewCard({ data }: VisitViewCardProps) {
  return (
    <div className="card" style={{ maxWidth: "48rem", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>Visit Summary</h2>
          {data.doctorName && (
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Attending: Dr. {data.doctorName}
            </p>
          )}
        </div>
        {data.visitDate && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Date</div>
            <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--color-text-primary)" }}>{formatDate(data.visitDate)}</div>
          </div>
        )}
      </div>

      <Section title="Vitals & Examination">
        <Field label="Patient Complaint" value={data.complain} />
        <Field label="Clinical Examination" value={data.examination} />
      </Section>

      <Section title="Labs & Investigations">
        <Field label="Laboratory Tests" value={data.labs} />
        <Field label="Other Investigations" value={data.investigation} />
      </Section>

      <Section title="Management">
        <Field label="Prescribed Drugs" value={data.drugs} />
        <Field label="Treatment Plan" value={data.treatment} />
      </Section>

      <Section title="Follow-up & Notes">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Field label="Next Visit Date" value={data.nextVisitDate ? formatDate(data.nextVisitDate) : ""} />
          <Field label="Next Visit Type" value={data.nextVisitType} />
        </div>
        <Field label="Additional Notes" value={data.notes} />
      </Section>
    </div>
  );
}
