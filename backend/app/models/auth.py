import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Investigator", nullable=False) # Administrator, Investigator, Analyst, Reviewer, Auditor
    badge_number = Column(String, nullable=True)
    department = Column(String, default="Special Investigations Division")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class RolePermission(Base):
    __tablename__ = "roles_permissions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    role = Column(String, index=True, nullable=False)
    permission = Column(String, nullable=False)
