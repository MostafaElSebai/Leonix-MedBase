// Home: Kiosk-style login (Doctor selection)

"use client";

import { useDoctorAuth } from "@/hooks/useDoctorAuth";
import { Alert, HomeHeader, HomeLoadingSkeleton, NoDoctorsFound, DoctorsGrid, AuthCleaner } from "@/components/ui/HomePage";


export default function DoctorsPage() {
  const {
    doctors,
    loading,
    fetchError,
    selectedId,
    pin,
    setPin,
    authStatus,
    handleCardClick,
    handleCancel,
    verifyPin,
  } = useDoctorAuth();


  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-app)",
        padding: "3rem 2rem",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* <AuthCleaner /> Still not working well */}
      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>

        {/* Header */}
        <HomeHeader />
        {/* Content */}
        {loading ? (
          <HomeLoadingSkeleton />
        ) : fetchError ? (
          <Alert message={fetchError} />
        ) : doctors.length === 0 ? (
          <NoDoctorsFound />
        ) : (
          <DoctorsGrid
            doctors={doctors}
            selectedId={selectedId}
            authStatus={authStatus}
            handleCardClick={handleCardClick}
            verifyPin={verifyPin}
            handleCancel={handleCancel}
            pin={pin}
            setPin={setPin}
          />
        )}
      </div>
    </div>
  );
}

