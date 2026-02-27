from fastapi import APIRouter, HTTPException, status, Query
from bson import ObjectId
from datetime import datetime, date
from typing import Optional
from database import get_database
from schemas import AttendanceCreate, AttendanceResponse, AttendanceUpdate, DashboardStats

router = APIRouter()

def attendance_serializer(att, employee_name: str = None) -> dict:
    return {
        "id": str(att["_id"]),
        "employee_id": att["employee_id"],
        "employee_name": employee_name or att.get("employee_name", ""),
        "date": att["date"],
        "status": att["status"],
        "created_at": att.get("created_at", "").isoformat() if isinstance(att.get("created_at"), datetime) else att.get("created_at", ""),
    }

@router.get("/", response_model=list[AttendanceResponse])
async def get_all_attendance(
    employee_id: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status")
):
    db = get_database()
    query = {}

    if employee_id:
        query["employee_id"] = employee_id.upper()
    if date_from:
        query.setdefault("date", {})["$gte"] = date_from
    if date_to:
        query.setdefault("date", {})["$lte"] = date_to
    if status_filter:
        query["status"] = status_filter

    records = []
    async for att in db.attendance.find(query).sort("date", -1):
        emp = await db.employees.find_one({"employee_id": att["employee_id"]})
        emp_name = emp["full_name"] if emp else "Unknown"
        records.append(attendance_serializer(att, emp_name))
    return records

@router.get("/stats/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    db = get_database()
    today = date.today().isoformat()

    total_employees = await db.employees.count_documents({})
    today_present = await db.attendance.count_documents({"date": today, "status": "Present"})
    today_absent = await db.attendance.count_documents({"date": today, "status": "Absent"})

    dept_pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    dept_cursor = db.employees.aggregate(dept_pipeline)
    departments = {}
    async for d in dept_cursor:
        departments[d["_id"]] = d["count"]

    return DashboardStats(
        total_employees=total_employees,
        total_present_today=today_present,
        total_absent_today=today_absent,
        departments=departments
    )

@router.get("/employee/{employee_id}", response_model=list[AttendanceResponse])
async def get_employee_attendance(
    employee_id: str,
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None)
):
    db = get_database()
    emp = await db.employees.find_one({"employee_id": employee_id.upper()})
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found")

    query = {"employee_id": employee_id.upper()}
    if date_from:
        query.setdefault("date", {})["$gte"] = date_from
    if date_to:
        query.setdefault("date", {})["$lte"] = date_to

    records = []
    async for att in db.attendance.find(query).sort("date", -1):
        records.append(attendance_serializer(att, emp["full_name"]))
    return records

@router.get("/employee/{employee_id}/summary")
async def get_employee_summary(employee_id: str):
    db = get_database()
    emp = await db.employees.find_one({"employee_id": employee_id.upper()})
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{employee_id}' not found")

    total_present = await db.attendance.count_documents({"employee_id": employee_id.upper(), "status": "Present"})
    total_absent = await db.attendance.count_documents({"employee_id": employee_id.upper(), "status": "Absent"})
    total = total_present + total_absent

    return {
        "employee_id": employee_id.upper(),
        "full_name": emp["full_name"],
        "total_present": total_present,
        "total_absent": total_absent,
        "total_days": total,
        "attendance_rate": round((total_present / total * 100), 1) if total > 0 else 0
    }

@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    db = get_database()

    # Validate employee exists
    emp = await db.employees.find_one({"employee_id": attendance.employee_id.upper()})
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{attendance.employee_id}' not found")

    # Check for duplicate attendance on same date
    existing = await db.attendance.find_one({
        "employee_id": attendance.employee_id.upper(),
        "date": attendance.date
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance for employee '{attendance.employee_id}' on {attendance.date} already exists. Use PUT to update."
        )

    att_data = {
        "employee_id": attendance.employee_id.upper(),
        "date": attendance.date,
        "status": attendance.status,
        "created_at": datetime.utcnow(),
    }

    result = await db.attendance.insert_one(att_data)
    created_att = await db.attendance.find_one({"_id": result.inserted_id})
    return attendance_serializer(created_att, emp["full_name"])

@router.put("/{attendance_id}", response_model=AttendanceResponse)
async def update_attendance(attendance_id: str, update: AttendanceUpdate):
    db = get_database()

    if not ObjectId.is_valid(attendance_id):
        raise HTTPException(status_code=400, detail="Invalid attendance ID format")

    att = await db.attendance.find_one({"_id": ObjectId(attendance_id)})
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    await db.attendance.update_one(
        {"_id": ObjectId(attendance_id)},
        {"$set": {"status": update.status}}
    )

    updated_att = await db.attendance.find_one({"_id": ObjectId(attendance_id)})
    emp = await db.employees.find_one({"employee_id": updated_att["employee_id"]})
    emp_name = emp["full_name"] if emp else "Unknown"
    return attendance_serializer(updated_att, emp_name)

@router.delete("/{attendance_id}", status_code=status.HTTP_200_OK)
async def delete_attendance(attendance_id: str):
    db = get_database()

    if not ObjectId.is_valid(attendance_id):
        raise HTTPException(status_code=400, detail="Invalid attendance ID format")

    att = await db.attendance.find_one({"_id": ObjectId(attendance_id)})
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    await db.attendance.delete_one({"_id": ObjectId(attendance_id)})
    return {"message": "Attendance record deleted successfully"}
