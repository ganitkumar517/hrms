import React, { useState } from "react";
import { Button, Input } from "@heroui/react";
import { useGetEmployeesQuery } from "../store/api/hrmsApi";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import EmployeeCard from "../components/employees/EmployeeCard";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";

const EmployeesPage: React.FC = () => {
  const { data: employees = [], isLoading, isError, refetch } = useGetEmployeesQuery();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [addModalOpen, setAddModalOpen] = useState(false);

  const departments = ["All", ...Array.from(new Set(employees.map((e) => e.department))).sort()];

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || emp.department === deptFilter;
    return matchSearch && matchDept;
  });

  if (isLoading) return <LoadingSpinner fullPage label="Loading employees..." />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="fade-in space-y-6 relative">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">
            {employees.length} total employee{employees.length !== 1 ? "s" : ""} in the system
          </p>
        </div>
        <Button
          color="primary"
          onPress={() => setAddModalOpen(true)}
          startContent={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name, ID, or email..."
          value={search}
          onValueChange={setSearch}
          variant="bordered"
          className="max-w-sm"
          startContent={
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        <div className="flex gap-2 flex-wrap">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${deptFilter === dept
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"
                }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title={search || deptFilter !== "All" ? "No employees found" : "No employees yet"}
          description={
            search || deptFilter !== "All"
              ? "Try adjusting your search or filter criteria."
              : "Add your first employee to get started."
          }
          action={
            !search && deptFilter === "All" ? (
              <Button color="primary" onPress={() => setAddModalOpen(true)}>
                Add First Employee
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      )}

      <AddEmployeeModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
};

export default EmployeesPage;
