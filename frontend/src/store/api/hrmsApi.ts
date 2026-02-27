import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Employee,
  EmployeeCreate,
  AttendanceRecord,
  AttendanceCreate,
  AttendanceUpdate,
  EmployeeSummary,
  DashboardStats,
} from "../../types";

const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

export const hrmsApi = createApi({
  reducerPath: "hrmsApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Employee", "Attendance", "Dashboard"],
  endpoints: (builder) => ({
    // Employee endpoints
    getEmployees: builder.query<Employee[], void>({
      query: () => "/api/employees/",
      providesTags: ["Employee"],
    }),
    getEmployee: builder.query<Employee, string>({
      query: (id) => `/api/employees/${id}`,
      providesTags: (result, error, id) => [{ type: "Employee", id }],
    }),
    createEmployee: builder.mutation<Employee, EmployeeCreate>({
      query: (body) => ({
        url: "/api/employees/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employee", "Dashboard"],
    }),
    deleteEmployee: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employee", "Attendance", "Dashboard"],
    }),
    getDepartments: builder.query<{ departments: string[] }, void>({
      query: () => "/api/employees/departments/list",
      providesTags: ["Employee"],
    }),

    // Attendance endpoints
    getAllAttendance: builder.query<
      AttendanceRecord[],
      {
        employee_id?: string;
        date_from?: string;
        date_to?: string;
        status?: string;
      }
    >({
      query: (params) => ({
        url: "/api/attendance/",
        params,
      }),
      providesTags: ["Attendance"],
    }),
    getEmployeeAttendance: builder.query<
      AttendanceRecord[],
      { employee_id: string; date_from?: string; date_to?: string }
    >({
      query: ({ employee_id, ...params }) => ({
        url: `/api/attendance/employee/${employee_id}`,
        params,
      }),
      providesTags: (result, error, arg) => [
        { type: "Attendance", id: arg.employee_id },
      ],
    }),
    getEmployeeSummary: builder.query<EmployeeSummary, string>({
      query: (id) => `/api/attendance/employee/${id}/summary`,
      providesTags: (result, error, id) => [{ type: "Attendance", id }],
    }),
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/api/attendance/stats/dashboard",
      providesTags: ["Dashboard"],
    }),
    markAttendance: builder.mutation<AttendanceRecord, AttendanceCreate>({
      query: (body) => ({
        url: "/api/attendance/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance", "Dashboard"],
    }),
    updateAttendance: builder.mutation<
      AttendanceRecord,
      { id: string; data: AttendanceUpdate }
    >({
      query: ({ id, data }) => ({
        url: `/api/attendance/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Attendance", "Dashboard"],
    }),
    deleteAttendance: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/api/attendance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance", "Dashboard"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetDepartmentsQuery,
  useGetAllAttendanceQuery,
  useGetEmployeeAttendanceQuery,
  useGetEmployeeSummaryQuery,
  useGetDashboardStatsQuery,
  useMarkAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
} = hrmsApi;
