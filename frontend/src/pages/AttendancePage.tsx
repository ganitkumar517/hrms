import React, { useState } from "react";
import { Button, Select, SelectItem, Card, CardBody } from "@heroui/react";
import {
  useGetAllAttendanceQuery,
  useGetEmployeesQuery,
} from "../store/api/hrmsApi";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorState from "../components/ui/ErrorState";
import AttendanceTable from "../components/attendance/AttendanceTable";
import MarkAttendanceModal from "../components/attendance/MarkAttendanceModal";
import { getTodayISO } from "../utils";

const AttendancePage: React.FC = () => {
  const [markModalOpen, setMarkModalOpen] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState(getTodayISO());
  const [dateTo, setDateTo] = useState(getTodayISO());
  const [statusFilter, setStatusFilter] = useState("");

  const { data: employees = [] } = useGetEmployeesQuery();

  const {
    data: attendance = [],
    isLoading,
    isError,
    refetch,
  } = useGetAllAttendanceQuery({
    employee_id: employeeFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    status: statusFilter || undefined,
  });

  const presentCount = attendance.filter((r) => r.status === "Present").length;
  const absentCount = attendance.filter((r) => r.status === "Absent").length;

  const clearFilters = () => {
    setEmployeeFilter("");
    setDateFrom(getTodayISO());
    setDateTo(getTodayISO());
    setStatusFilter("");
  };

  return (
    <div className="fade-in space-y-6 relative">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">
            Track and manage daily attendance records
          </p>
        </div>
        <Button
          color="primary"
          onPress={() => setMarkModalOpen(true)}
          startContent={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Mark Attendance
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Records</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-gray-500 mt-1">Present</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-red-500">{absentCount}</p>
          <p className="text-xs text-gray-500 mt-1">Absent</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-100" shadow="sm">
        <CardBody className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                Employee
              </label>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.full_name} ({emp.employee_id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card className="border border-gray-100" shadow="sm">
        <CardBody className="p-0">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">
              Records
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({attendance.length} found)
              </span>
            </h2>
          </div>
          {isLoading ? (
            <LoadingSpinner label="Loading attendance..." />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <div className="px-6 py-4">
              <AttendanceTable records={attendance} showEmployee={true} />
            </div>
          )}
        </CardBody>
      </Card>

      <MarkAttendanceModal
        isOpen={markModalOpen}
        onClose={() => setMarkModalOpen(false)}
      />
    </div>
  );
};

export default AttendancePage;
