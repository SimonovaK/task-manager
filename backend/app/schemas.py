from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
from datetime import date, datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    is_done: Optional[bool] = False

class TaskCreate(TaskBase):
    @field_validator('deadline')
    @classmethod
    def deadline_not_in_past(cls, v):
        if v is not None:
            if v < date.today():
                raise ValueError('Срок выполнения не может быть в прошлом')
        return v

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_done: Optional[bool] = None
    deadline: Optional[date] = None
    
    @field_validator('deadline')
    @classmethod
    def deadline_not_in_past(cls, v):
        if v is not None:
            if v < date.today():
                raise ValueError('Срок выполнения не может быть в прошлом')
        return v

class Task(TaskBase):
    id: int
    created_at: datetime
    is_nearing_deadline: bool
    model_config = ConfigDict(from_attributes=True)