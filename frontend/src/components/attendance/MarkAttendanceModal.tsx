import React from "react";
import { Button, Select, SelectItem, Input } from "@heroui/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useMarkAttendanceMutation, useGetEmployeesQuery } from "../../store/api/hrmsApi";
import { useToast, parseApiError } from "../../hooks";
import { getTodayISO } from "../../utils";

const validationSchema = Yup.object({
  employee_id: Yup.string().required("Employee is required"),
  date: Yup.string().required("Date is required"),
  status: Yup.string()
    .oneOf(["Present", "Absent"], "Status must be Present or Absent")
    .required("Status is required"),
});

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedEmployeeId?: string;
}

const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
  preselectedEmployeeId,
}) => {
  const [markAttendance] = useMarkAttendanceMutation();
  const { data: employees = [] } = useGetEmployeesQuery();
  const { toast } = useToast();

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      await markAttendance(values).unwrap();
      toast({
        type: "success",
        title: "Attendance Marked",
        message: `Attendance recorded as ${values.status}.`,
      });
      resetForm();
      onClose();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Failed to Mark Attendance",
        message: parseApiError(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <Formik
          initialValues={{
            employee_id: preselectedEmployeeId || "",
            date: getTodayISO(),
            status: "Present",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form className="flex flex-col h-full">
              <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex flex-col gap-1">
                <span className="text-lg font-bold">Mark Attendance</span>
                <span className="text-sm text-gray-400 font-normal">
                  Record attendance for an employee
                </span>
              </div>

              <div className="px-6 py-4 space-y-4 flex-1 overflow-y-auto">
                {!preselectedEmployeeId && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Employee
                    </label>
                    <Select
                      placeholder="Select an employee"
                      selectedKeys={values.employee_id ? [values.employee_id] : []}
                      onSelectionChange={(keys: any) => {
                        const selected = Array.from(keys)[0] as string;
                        setFieldValue("employee_id", selected);
                      }}
                      isInvalid={!!(touched.employee_id && errors.employee_id)}
                      errorMessage={touched.employee_id ? errors.employee_id : ""}
                      variant="bordered"
                      isRequired
                    >
                      {employees.map((emp) => (
                        <SelectItem key={emp.employee_id}>
                          {emp.full_name} ({emp.employee_id})
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={values.date}
                    onValueChange={(val: string) => setFieldValue("date", val)}
                    isInvalid={!!(touched.date && errors.date)}
                    errorMessage={touched.date ? errors.date : ""}
                    variant="bordered"
                    isRequired
                    max={getTodayISO()}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <Select
                    selectedKeys={[values.status]}
                    onSelectionChange={(keys: any) => {
                      const selected = Array.from(keys)[0] as string;
                      setFieldValue("status", selected);
                    }}
                    isInvalid={!!(touched.status && errors.status)}
                    errorMessage={touched.status ? errors.status : ""}
                    variant="bordered"
                    isRequired
                  >
                    <SelectItem key="Present" className="text-success">
                      ✓ Present
                    </SelectItem>
                    <SelectItem key="Absent" className="text-danger">
                      ✗ Absent
                    </SelectItem>
                  </Select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="flat" onPress={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" color="primary" isLoading={isSubmitting}>
                  Mark Attendance
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default MarkAttendanceModal;
