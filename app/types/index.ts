export type Doctor = {
  id: string | number;
  name?: string;
  email?: string;
  specialty?: string;
  pin?: string;
  [key: string]: unknown;
};

export type AuthStatus = "idle" | "loading" | "success" | "error";

export type Patient = {
  id: string | number;
  name: string;
  phone?: string;
  doctorId?: string;
  notes?: string;
  firstVisitDate?: string;
  address?: string;
  age?: number;
  lastVisitDate?: string;
  assignedDoctorName?: string;
};

export type Visit = {
  id: string | number;
  patientId?: string | number;
  visitDate?: string;
  doctorName?: string;
  complain?: string;
  drugs?: string;
  examination?: string;
  labs?: string;
  investigation?: string;
  treatment?: string;
  nextVisitDate?: string;
  nextVisitType?: "consultation" | "examination" | "";
  notes?: string;
};
