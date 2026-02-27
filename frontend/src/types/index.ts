export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  created_at?: string;
}

export interface EmployeeCreate {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  status: "Present" | "Absent";
  created_at?: string;
}

export interface AttendanceCreate {
  employee_id: string;
  date: string;
  status: "Present" | "Absent";
}

export interface AttendanceUpdate {
  status: "Present" | "Absent";
}

export interface EmployeeSummary {
  employee_id: string;
  full_name: string;
  total_present: number;
  total_absent: number;
  total_days: number;
  attendance_rate: number;
}

export interface DashboardStats {
  total_employees: number;
  total_present_today: number;
  total_absent_today: number;
  departments: Record<string, number>;
}

export interface ApiError {
  detail: string | Array<{ msg: string; loc: string[] }>;
}
