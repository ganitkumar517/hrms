import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import {
  useGetDashboardStatsQuery,
  useGetEmployeesQuery,
  useGetAllAttendanceQuery,
} from "../store/api/hrmsApi";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorState from "../components/ui/ErrorState";
import { getTodayISO, formatDate, getInitials, getAvatarColor } from "../utils";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon: React.ReactNode;
}> = ({ title, value, subtitle, color, icon }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const StatusChip = Chip as any;
  const navigate = useNavigate();
  const today = getTodayISO();

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetDashboardStatsQuery();

  const { data: employees = [] } = useGetEmployeesQuery();

  const { data: todayAttendance = [] } = useGetAllAttendanceQuery({
    date_from: today,
    date_to: today,
  });

  if (statsLoading) return <LoadingSpinner fullPage label="Loading dashboard..." />;
  if (statsError) return <ErrorState onRetry={refetchStats} />;

  const absentToday = stats!.total_employees - (stats?.total_present_today || 0);
  const attendanceRate =
    stats!.total_employees > 0
      ? Math.round(((stats?.total_present_today || 0) / stats!.total_employees) * 100)
      : 0;

  return (
    <div className="fade-in space-y-6 relative">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Overview of today's HR activity —{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            color="primary"
            onPress={() => navigate("/employees")}
          >
            Manage Employees
          </Button>
          <Button
            size="sm"
            variant="flat"
            onPress={() => navigate("/attendance")}
          >
            View Attendance
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={stats!.total_employees}
          subtitle="Active team members"
          color="bg-blue-50"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Present Today"
          value={stats?.total_present_today || 0}
          subtitle={`${attendanceRate}% attendance rate`}
          color="bg-green-50"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Absent Today"
          value={stats?.total_absent_today || 0}
          subtitle="Marked absent"
          color="bg-red-50"
          icon={
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Departments"
          value={Object.keys(stats?.departments || {}).length}
          subtitle="Across organization"
          color="bg-purple-50"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-100" shadow="sm">
            <CardBody className="p-0">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Today's Attendance</h2>
                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  onPress={() => navigate("/attendance")}
                >
                  View All
                </Button>
              </div>
              {todayAttendance.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-400 text-sm">No attendance marked today</p>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="mt-3"
                    onPress={() => navigate("/attendance")}
                  >
                    Mark Attendance
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {todayAttendance.slice(0, 8).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg ${getAvatarColor(record.employee_name || "")} flex items-center justify-center`}
                        >
                          <span className="text-white text-xs font-bold">
                            {getInitials(record.employee_name || "?")}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {record.employee_name}
                          </p>
                          <p className="text-xs text-gray-400">{record.employee_id}</p>
                        </div>
                      </div>
                      <StatusChip
                        color={record.status === "Present" ? "success" : "danger"}
                        variant="flat"
                      >
                        {record.status}
                      </StatusChip>
                    </div>
                  ))}
                  {todayAttendance.length > 8 && (
                    <div className="px-6 py-3 text-center">
                      <p className="text-xs text-gray-400">
                        +{todayAttendance.length - 8} more records
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Department Breakdown */}
        <div>
          <Card className="border border-gray-100" shadow="sm">
            <CardBody className="p-0">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Departments</h2>
              </div>
              {Object.keys(stats?.departments || {}).length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-400 text-sm">No departments yet</p>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-3">
                  {Object.entries(stats?.departments || {}).map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <p className="text-sm text-gray-700 font-medium">{dept}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{
                              width: `${(count / stats!.total_employees) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Employees */}
          <Card className="border border-gray-100 mt-4" shadow="sm">
            <CardBody className="p-0">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Recent Employees</h2>
              </div>
              {employees.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-400 text-sm">No employees yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {employees.slice(0, 5).map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/employees/${emp.employee_id}`)}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${getAvatarColor(emp.full_name)} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="text-white text-xs font-bold">
                          {getInitials(emp.full_name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {emp.full_name}
                        </p>
                        <p className="text-xs text-gray-400">{emp.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
