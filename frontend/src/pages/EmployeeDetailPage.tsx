import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Chip, Divider } from "@heroui/react";
import {
  useGetEmployeeQuery,
  useGetEmployeeAttendanceQuery,
  useGetEmployeeSummaryQuery,
} from "../store/api/hrmsApi";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorState from "../components/ui/ErrorState";
import AttendanceTable from "../components/attendance/AttendanceTable";
import MarkAttendanceModal from "../components/attendance/MarkAttendanceModal";
import { getInitials, getAvatarColor, getDepartmentColor, formatDate } from "../utils";

const EmployeeDetailPage: React.FC = () => {
  const StatusChip = Chip as any;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [markModalOpen, setMarkModalOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const {
    data: employee,
    isLoading: empLoading,
    isError: empError,
    refetch: refetchEmp,
  } = useGetEmployeeQuery(id!);

  const { data: attendance = [], isLoading: attLoading } =
    useGetEmployeeAttendanceQuery({
      employee_id: id!,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });

  const { data: summary } = useGetEmployeeSummaryQuery(id!);

  if (empLoading) return <LoadingSpinner fullPage label="Loading employee..." />;
  if (empError || !employee) return <ErrorState onRetry={refetchEmp} />;

  const avatarColor = getAvatarColor(employee.full_name);

  return (
    <div className="fade-in space-y-6 relative">
      {/* Back */}
      <button
        onClick={() => navigate("/employees")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Employees
      </button>

      {/* Employee Profile */}
      <Card className="border border-gray-100" shadow="sm">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div
              className={`w-20 h-20 rounded-2xl ${avatarColor} flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white text-2xl font-bold">
                {getInitials(employee.full_name)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {employee.full_name}
                  </h1>
                  <p className="text-gray-500 mt-1">{employee.employee_id}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusChip
                      color={getDepartmentColor(employee.department) as any}
                      variant="flat"
                    >
                      {employee.department}
                    </StatusChip>
                  </div>
                </div>
                <Button
                  color="primary"
                  size="sm"
                  onPress={() => setMarkModalOpen(true)}
                >
                  Mark Attendance
                </Button>
              </div>

              <Divider className="my-4" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Email</p>
                  <p className="text-sm text-gray-700 mt-1">{employee.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Department</p>
                  <p className="text-sm text-gray-700 mt-1">{employee.department}</p>
                </div>
                {employee.created_at && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Joined</p>
                    <p className="text-sm text-gray-700 mt-1">{formatDate(employee.created_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Days", value: summary.total_days, color: "text-blue-600 bg-blue-50" },
            { label: "Days Present", value: summary.total_present, color: "text-green-600 bg-green-50" },
            { label: "Days Absent", value: summary.total_absent, color: "text-red-500 bg-red-50" },
            {
              label: "Attendance Rate",
              value: `${summary.attendance_rate}%`,
              color: summary.attendance_rate >= 80 ? "text-green-600 bg-green-50" : "text-orange-600 bg-orange-50",
            },
          ].map((s) => (
            <div key={s.label} className="stat-card text-center">
              <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Records */}
      <Card className="border border-gray-100" shadow="sm">
        <CardBody className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex-1">Attendance Records</h2>
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="From"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="To"
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="text-xs text-gray-400 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {attLoading ? (
            <LoadingSpinner label="Loading attendance..." />
          ) : (
            <div className="px-6 py-4">
              <AttendanceTable records={attendance} showEmployee={false} />
            </div>
          )}
        </CardBody>
      </Card>

      <MarkAttendanceModal
        isOpen={markModalOpen}
        onClose={() => setMarkModalOpen(false)}
        preselectedEmployeeId={id}
      />
    </div>
  );
};

export default EmployeeDetailPage;
