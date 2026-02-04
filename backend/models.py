 index.htmlfrom sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Profile fields
    vorname = Column(String, nullable=True)
    nachname = Column(String, nullable=True)
    position = Column(String, default="User")

    requests = relationship("ContactRequest", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    name_en = Column(String)
    name_de = Column(String, index=True)

    projects = relationship("AdminProject", back_populates="category")
    requests = relationship("ContactRequest", back_populates="category")

class AdminProject(Base):
    __tablename__ = "admin_projects"

    id = Column(Integer, primary_key=True, index=True)
    project_code = Column(String, unique=True, index=True)
    name = Column(String)
    description = Column(Text)
    status = Column(String) # planned, in_progress, completed
    year = Column(Integer)
    type = Column(String)
    size = Column(String)
    color = Column(String)
    end_date = Column(Date)
    category_id = Column(Integer, ForeignKey("categories.id"))

    category = relationship("Category", back_populates="projects")

class Kunde(Base):
    __tablename__ = "kunden"
    id = Column(Integer, primary_key=True, index=True)
    firma = Column(String)
    # Add other fields as needed

class Ware(Base):
    __tablename__ = "waren"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    # Add other fields as needed

class Aufgabe(Base):
    __tablename__ = "aufgaben"
    id = Column(Integer, primary_key=True, index=True)
    titel = Column(String)
    status = Column(String)
    prioritaet = Column(String)
    zugewiesen_name = Column(String, nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())

class Dokument(Base):
    __tablename__ = "dokumente"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    created_date = Column(DateTime(timezone=True), server_default=func.now())

class ContactRequest(Base):
    __tablename__ = "contact_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String)
    email = Column(String)
    reason = Column(String)
    message = Column(Text)
    status = Column(String, default="new")
    message_admin = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    category = relationship("Category", back_populates="requests")
    user = relationship("User", back_populates="requests")
