from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import date
import re

class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=20)
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=100)

    @field_validator('employee_id')
    @classmethod
    def validate_employee_id(cls, v):
        if not re.match(r'^[A-Za-z0-9\-_]+$', v):
            raise ValueError('Employee ID can only contain letters, numbers, hyphens, and underscores')
        return v.upper()

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        return v.strip()

class EmployeeResponse(BaseModel):
    id: str
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: Optional[str] = None

class AttendanceCreate(BaseModel):
    employee_id: str
    date: str  # ISO format: YYYY-MM-DD
    status: Literal["Present", "Absent"]

    @field_validator('date')
    @classmethod
    def validate_date(cls, v):
        try:
            date.fromisoformat(v)
        except ValueError:
            raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v

class AttendanceResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: Optional[str] = None
    date: str
    status: str
    created_at: Optional[str] = None

class AttendanceUpdate(BaseModel):
    status: Literal["Present", "Absent"]

class DashboardStats(BaseModel):
    total_employees: int
    total_present_today: int
    total_absent_today: int
    departments: dict
