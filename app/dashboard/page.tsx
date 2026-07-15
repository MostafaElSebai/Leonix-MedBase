// Dashboard: Search & Patient List after doctor login

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentDoctor } from "@/hooks/useCurrentDoctor";
import { Patient } from "@/app/types/index";
import {
  DashboardHeader,
  PatientSearchBar,
  PatientTable,
  Pagination,
  DateFilter,
} from "@/components/ui/dashboard";
import { usePatients } from "@/hooks/usePatients";
import { useDoctors } from "@/hooks/useDoctors";
import { calculateAge } from "@/lib/utils";
import { deletePatient } from "@/lib/watermelon/actions";

export default function DashboardPage() {
  const router = useRouter();
  const { doctor, loading } = useCurrentDoctor();
  const doctors = useDoctors();

  const [currentPage, setCurrentPage] = useState(1);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [doctorIdFilter, setDoctorIdFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({ day: "", month: "", year: "" });
  const PAGE_SIZE = 100;

  const watermelonPatients = usePatients(search1, search2, doctorIdFilter, dateFilter);

  // Map to the UI expected type
  const filtered: Patient[] = watermelonPatients.map((ep) => ({
    id: ep.patient.id,
    name: ep.patient.name,
    phone: ep.patient.phone,
    age: ep.patient.dob ? (calculateAge(ep.patient.dob) ?? undefined) : undefined,
    address: ep.patient.address,
    firstVisitDate: ep.patient.historicalFirstVisit,
    lastVisitDate: ep.lastVisitDate,
    assignedDoctorName: ep.assignedDoctorName,
  }));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch1 = (value: string) => {
    setSearch1(value);
    setCurrentPage(1);
  };

  const handleSearch2 = (value: string) => {
    setSearch2(value);
    setCurrentPage(1);
  };

  // Warm up the Next.js router and Service Worker runtime cache for all static offline shells
  useEffect(() => {
    if (doctor && !loading) {
      router.prefetch("/patients/profile");
      router.prefetch("/patients/profile/edit");
      router.prefetch("/patients/new");
      router.prefetch("/visits/view");
      router.prefetch("/visits/view/edit");
      router.prefetch("/visits/new");
    }
  }, [doctor, loading, router]);

  // Ensure user is authenticated before displaying dashboard
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Authenticating...</p>
      </div>
    );
  }

  if (!doctor) {
    router.push("/");
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-app)" }}>
      {/* Sticky Header */}
      <DashboardHeader />

      {/* Page Content */}
      <main
        style={{
          maxWidth: "90rem",
          margin: "0 auto",
          padding: "2rem 1.5rem",
        }}
      >
        {/* Search & Filter */}
        <div style={{ marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <PatientSearchBar
            value={search1}
            onChange={handleSearch1}
            placeholder="Search by name, phone or address..."
          />
          <PatientSearchBar
            value={search2}
            onChange={handleSearch2}
            placeholder="Filter results further..."
          />
          <DateFilter
            value={dateFilter}
            onChange={setDateFilter}
          />
          <select
            className="form-input"
            value={doctorIdFilter}
            onChange={(e) => setDoctorIdFilter(e.target.value)}
            style={{ cursor: "pointer", height: "100%", minHeight: "2.5rem" }}
          >
            <option value="">All Doctors</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Patient Table */}
        <div style={{ marginBottom: "1.5rem" }}>
          <PatientTable
            patients={paginated}
            onDelete={async (id) => {
              try {
                await deletePatient(String(id));
              } catch (err) {
                console.error("Failed to delete patient", err);
                alert("Failed to delete patient.");
              }
            }}
          />
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            totalCount={filtered.length}
            pageSize={PAGE_SIZE}
            onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            onFirst={() => setCurrentPage(1)}
            onLast={() => setCurrentPage(totalPages)}
          />
        )}
      </main>
    </div>
  );
}