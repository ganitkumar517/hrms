import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Employee } from "../../types";
import { getInitials, getAvatarColor, getDepartmentColor } from "../../utils";
import { useDeleteEmployeeMutation } from "../../store/api/hrmsApi";
import { useToast, parseApiError } from "../../hooks";

interface EmployeeCardProps {
  employee: Employee;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  const StatusChip = Chip as any;
  const navigate = useNavigate();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(employee.employee_id).unwrap();
      toast({
        type: "success",
        title: "Employee Deleted",
        message: `${employee.full_name} has been removed.`,
      });
      setConfirmOpen(false);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Delete Failed",
        message: parseApiError(err),
      });
    } finally {
      setDeleting(false);
    }
  };

  const avatarColor = getAvatarColor(employee.full_name);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200 border border-gray-100" shadow="sm">
        <CardBody className="p-5">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl ${avatarColor} flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white font-bold text-sm">
                {getInitials(employee.full_name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {employee.full_name}
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">{employee.employee_id}</p>
              <p className="text-gray-500 text-xs mt-1 truncate">{employee.email}</p>
              <div className="mt-2">
                <StatusChip
                  variant="flat"
                  color={getDepartmentColor(employee.department) as any}
                >
                  {employee.department}
                </StatusChip>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button
              size="sm"
              variant="flat"
              color="primary"
              className="flex-1"
              onPress={() => navigate(`/employees/${employee.employee_id}`)}
            >
              View Details
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="danger"
              isIconOnly
              onPress={() => setConfirmOpen(true)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Delete Confirmation */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} size="sm" placement="center">
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader>Confirm Deletion</ModalHeader>
              <ModalBody>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-900">
                    {employee.full_name}
                  </span>
                  ? This will also remove all their attendance records. This action
                  cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={close} isDisabled={deleting}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDelete}
                  isLoading={deleting}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmployeeCard;
