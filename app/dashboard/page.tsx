// Dashboard: Search & Patient List after doctor login

"use client";

import { useState } from "react";
import { Patient } from "@/app/types/index";
import {
  DashboardHeader,
  PatientSearchBar,
  PatientTable,
  Pagination,
} from "@/components/ui/dashboard";
import { usePatients } from "@/hooks/usePatients";
import { calculateAge } from "@/lib/utils";
import { deletePatient } from "@/lib/watermelon/actions";

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 15;

  const watermelonPatients = usePatients(search);

  // Map to the UI expected type
  const filtered: Patient[] = watermelonPatients.map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    age: p.dob ? (calculateAge(p.dob) ?? undefined) : undefined,
    address: p.address,
    firstVisitDate: p.historicalFirstVisit,
    lastVisitDate: undefined,
    lastVisitDoctor: undefined,
  }));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // reset to page 1 on new search
  };

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
        {/* Search */}
        <div style={{ marginBottom: "1.5rem" }}>
          <PatientSearchBar value={search} onChange={handleSearch} />
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
          />
        )}
      </main>
    </div>
  );
}