from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from datetime import datetime
from database import get_database
from schemas import EmployeeCreate, EmployeeResponse

router = APIRouter()

def employee_serializer(emp) -> dict:
    return {
        "id": str(emp["_id"]),
        "employee_id": emp["employee_id"],
        "full_name": emp["full_name"],
        "email": emp["email"],
        "department": emp["department"],
        "created_at": emp.get("created_at", "").isoformat() if isinstance(emp.get("created_at"), datetime) else emp.get("created_at", ""),
    }

@router.get("/", response_model=list[EmployeeResponse])
async def get_all_employees():
    db = get_database()
    employees = []
    async for emp in db.employees.find().sort("created_at", -1):
        employees.append(employee_serializer(emp))
    return employees

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str):
    db = get_database()
    emp = await db.employees.find_one({"employee_id": employee_id.upper()})
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee with ID '{employee_id}' not found")
    return employee_serializer(emp)

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    db = get_database()

    # Check duplicate employee_id
    existing_id = await db.employees.find_one({"employee_id": employee.employee_id})
    if existing_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{employee.employee_id}' already exists"
        )

    # Check duplicate email
    existing_email = await db.employees.find_one({"email": employee.email.lower()})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with email '{employee.email}' already exists"
        )

    emp_data = {
        "employee_id": employee.employee_id,
        "full_name": employee.full_name,
        "email": employee.email.lower(),
        "department": employee.department,
        "created_at": datetime.utcnow(),
    }

    result = await db.employees.insert_one(emp_data)
    created_emp = await db.employees.find_one({"_id": result.inserted_id})
    return employee_serializer(created_emp)

@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
async def delete_employee(employee_id: str):
    db = get_database()
    emp = await db.employees.find_one({"employee_id": employee_id.upper()})
    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee with ID '{employee_id}' not found")

    # Also delete attendance records
    await db.attendance.delete_many({"employee_id": employee_id.upper()})
    await db.employees.delete_one({"employee_id": employee_id.upper()})

    return {"message": f"Employee '{employee_id}' and their attendance records deleted successfully"}

@router.get("/departments/list")
async def get_departments():
    db = get_database()
    departments = await db.employees.distinct("department")
    return {"departments": sorted(departments)}
