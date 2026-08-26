from typing import Literal

from pydantic import BaseModel, EmailStr, Field


UserRole = Literal[
    "admin",
    "analyst",
    "viewer",
]


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(
        min_length=3,
        max_length=100,
    )
    password: str = Field(
        min_length=8,
        max_length=128,
    )
    role: UserRole = "analyst"


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    role: UserRole
    is_active: bool

    model_config = {
        "from_attributes": True,
    }