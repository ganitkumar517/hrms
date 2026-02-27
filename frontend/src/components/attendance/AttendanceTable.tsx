import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from "@heroui/react";
import { AttendanceRecord } from "../../types";
import { formatDate } from "../../utils";
import { useDeleteAttendanceMutation, useUpdateAttendanceMutation } from "../../store/api/hrmsApi";
import { useToast, parseApiError } from "../../hooks";
import EmptyState from "../ui/EmptyState";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  showEmployee?: boolean;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  showEmployee = true,
}) => {
  const StatusChip = Chip as any;
  const [deleteAttendance] = useDeleteAttendanceMutation();
  const [updateAttendance] = useUpdateAttendanceMutation();
  const { toast } = useToast();
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<"Present" | "Absent">("Present");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAttendance(id).unwrap();
      toast({ type: "success", title: "Record Deleted", message: "Attendance record removed." });
    } catch (err: any) {
      toast({ type: "error", title: "Delete Failed", message: parseApiError(err) });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditStatus(record.status);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setSaving(true);
    try {
      await updateAttendance({
        id: editingRecord.id,
        data: { status: editStatus },
      }).unwrap();
      toast({ type: "success", title: "Attendance Updated", message: "Record updated successfully." });
      setEditingRecord(null);
    } catch (err: any) {
      toast({ type: "error", title: "Update Failed", message: parseApiError(err) });
    } finally {
      setSaving(false);
    }
  };

  if (records.length === 0) {
    return (
      <EmptyState
        title="No Attendance Records"
        description="No attendance records found. Start by marking attendance for employees."
      />
    );
  }

  type ColumnKey = "employee" | "date" | "status" | "actions";

  const columns: { key: ColumnKey; label: string }[] = [
    ...(showEmployee ? [{ key: "employee" as ColumnKey, label: "EMPLOYEE" }] : []),
    { key: "date", label: "DATE" },
    { key: "status", label: "STATUS" },
    { key: "actions", label: "ACTIONS" },
  ];

  return (
    <>
      <Table
        aria-label="Attendance records"
        removeWrapper
        classNames={{
          th: "bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider",
          td: "py-3 text-sm",
        }}
      >
        <TableHeader columns={columns}>
          {(col) => (
            <TableColumn key={col.key} align={col.key === "actions" ? "end" : "start"}>
              {col.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={records}>
          {(record) => (
            <TableRow key={record.id} className="hover:bg-gray-50 border-b border-gray-100">
              {columns.map((col) => {
                switch (col.key) {
                  case "employee":
                    return (
                      <TableCell key={col.key}>
                        <div>
                          <p className="font-medium text-gray-900">{record.employee_name}</p>
                          <p className="text-xs text-gray-400">{record.employee_id}</p>
                        </div>
                      </TableCell>
                    );
                  case "date":
                    return (
                      <TableCell key={col.key}>
                        <span className="font-medium text-gray-700">
                          {formatDate(record.date)}
                        </span>
                      </TableCell>
                    );
                  case "status":
                    return (
                      <TableCell key={col.key}>
                        <StatusChip
                          color={record.status === "Present" ? "success" : "danger"}
                          variant="flat"
                        >
                          {record.status === "Present" ? "✓ " : "✗ "}
                          {record.status}
                        </StatusChip>
                      </TableCell>
                    );
                  case "actions":
                    return (
                      <TableCell key={col.key}>
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            isIconOnly
                            onPress={() => handleEdit(record)}
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Button>
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            isIconOnly
                            isLoading={deletingId === record.id}
                            onPress={() => handleDelete(record.id)}
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </div>
                      </TableCell>
                    );
                }
              })}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        size="sm"
        placement="center"
      >
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader>Edit Attendance</ModalHeader>
              <ModalBody>
                {editingRecord && (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(editingRecord.date)}</p>
                      {showEmployee && (
                        <>
                          <p className="text-sm text-gray-500 mt-2">Employee</p>
                          <p className="font-semibold text-gray-900">{editingRecord.employee_name}</p>
                        </>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </p>
                      <Select
                        selectedKeys={[editStatus]}
                        onSelectionChange={(keys: any) => {
                          const selected = Array.from(keys)[0] as "Present" | "Absent";
                          setEditStatus(selected);
                        }}
                        variant="bordered"
                      >
                        <SelectItem key="Present">✓ Present</SelectItem>
                        <SelectItem key="Absent">✗ Absent</SelectItem>
                      </Select>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={close} isDisabled={saving}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSaveEdit} isLoading={saving}>
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AttendanceTable;
