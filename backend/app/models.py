from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, date, timedelta

Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    is_done = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    deadline = Column(Date, nullable=True)
    
    def is_nearing_deadline(self):
        if not self.deadline or self.is_done:
            return False
        
        deadline_dt = datetime.combine(self.deadline, datetime.min.time())
        now = datetime.now()
        time_left = deadline_dt - now
        return timedelta(hours=0) <= time_left <= timedelta(hours=24)