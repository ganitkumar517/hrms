import React from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useCreateEmployeeMutation } from "../../store/api/hrmsApi";
import { useToast, parseApiError } from "../../hooks";

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Design",
  "Legal",
  "IT",
  "Product",
];

const validationSchema = Yup.object({
  employee_id: Yup.string()
    .required("Employee ID is required")
    .max(20, "Employee ID must be at most 20 characters")
    .matches(
      /^[A-Za-z0-9\-_]+$/,
      "Only letters, numbers, hyphens, and underscores allowed"
    ),
  full_name: Yup.string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Must be a valid email address"),
  department: Yup.string().required("Department is required"),
});

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createEmployee] = useCreateEmployeeMutation();
  const { toast } = useToast();

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      await createEmployee(values).unwrap();
      toast({ type: "success", title: "Employee Added", message: `${values.full_name} has been added successfully.` });
      resetForm();
      onClose();
    } catch (err: any) {
      toast({ type: "error", title: "Failed to Add Employee", message: parseApiError(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectClassNames = {
    base: "w-full",
    trigger: "bg-white",
    listbox: "bg-white",
    popoverContent: "bg-white shadow-xl border border-gray-100",
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <Formik
          initialValues={{
            employee_id: "",
            full_name: "",
            email: "",
            department: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form className="flex flex-col h-full">
              <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex flex-col gap-1">
                <span className="text-lg font-bold">Add New Employee</span>
                <span className="text-sm text-gray-400 font-normal">
                  Fill in the details to add a new team member
                </span>
              </div>

              <div className="px-6 py-4 space-y-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Employee ID
                    </label>
                    <Input
                      placeholder="e.g. EMP001"
                      value={values.employee_id}
                      onValueChange={(val: string) => setFieldValue("employee_id", val)}
                      isInvalid={!!(touched.employee_id && errors.employee_id)}
                      errorMessage={touched.employee_id ? errors.employee_id : ""}
                      variant="bordered"
                      isRequired
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <Input
                      placeholder="e.g. John Doe"
                      value={values.full_name}
                      onValueChange={(val: string) => setFieldValue("full_name", val)}
                      isInvalid={!!(touched.full_name && errors.full_name)}
                      errorMessage={touched.full_name ? errors.full_name : ""}
                      variant="bordered"
                      isRequired
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <Input
                    placeholder="e.g. john@company.com"
                    type="email"
                    value={values.email}
                    onValueChange={(val: string) => setFieldValue("email", val)}
                    isInvalid={!!(touched.email && errors.email)}
                    errorMessage={touched.email ? errors.email : ""}
                    variant="bordered"
                    isRequired
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <Select
                    classNames={selectClassNames}
                    placeholder="Select a department"
                    selectedKeys={values.department ? [values.department] : []}
                    onSelectionChange={(keys: any) => {
                      const selected = Array.from(keys)[0] as string;
                      setFieldValue("department", selected);
                    }}
                    isInvalid={!!(touched.department && errors.department)}
                    errorMessage={touched.department ? errors.department : ""}
                    variant="bordered"
                    isRequired
                  >
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept}>{dept}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <Button
                  variant="flat"
                  onPress={onClose}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isSubmitting}
                >
                  Add Employee
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
