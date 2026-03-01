"""SQLAlchemy models for Nebula MVP."""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Text, DateTime, ForeignKey, create_engine
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()

DATABASE_URL = "sqlite:///./nebula.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def gen_id() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_id)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    courses = relationship("Course", back_populates="user")


class Course(Base):
    __tablename__ = "courses"
    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="courses")
    nodes = relationship("ConceptNode", back_populates="course", cascade="all, delete-orphan")
    edges = relationship("ConceptEdge", back_populates="course", cascade="all, delete-orphan")


class ConceptNode(Base):
    __tablename__ = "concept_nodes"
    id = Column(String, primary_key=True, default=gen_id)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    label = Column(String, nullable=False)
    description = Column(Text, default="")
    concept_type = Column(String, default="concept")  # concept | process | formula
    confidence = Column(Float, default=0.0)
    course = relationship("Course", back_populates="nodes")
    resources = relationship("NodeResource", back_populates="concept_node", cascade="all, delete-orphan")


class ConceptEdge(Base):
    __tablename__ = "concept_edges"
    id = Column(String, primary_key=True, default=gen_id)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    source_id = Column(String, ForeignKey("concept_nodes.id"), nullable=False)
    target_id = Column(String, ForeignKey("concept_nodes.id"), nullable=False)
    relationship_type = Column(String, default="is_prerequisite_of")
    course = relationship("Course", back_populates="edges")
    source = relationship("ConceptNode", foreign_keys=[source_id])
    target = relationship("ConceptNode", foreign_keys=[target_id])


class SolvedProblem(Base):
    """Stores completed poll problems for sync and history."""
    __tablename__ = "solved_problems"
    id = Column(String, primary_key=True, default=gen_id)
    concept_id = Column(String, ForeignKey("concept_nodes.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(Text, nullable=False)  # JSON array of option strings
    correct_answer = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=False)
    eval_result = Column(String(20), nullable=False)  # correct | partial | wrong
    created_at = Column(DateTime, default=datetime.utcnow)


class NodeResource(Base):
    """Stores learning resources per concept node."""
    __tablename__ = "node_resources"
    id = Column(String, primary_key=True, default=gen_id)
    concept_id = Column(String, ForeignKey("concept_nodes.id"), nullable=False)
    title = Column(String, nullable=False)
    url = Column(Text, nullable=False)
    type = Column(String(20), nullable=False)  # video | article
    why = Column(Text, default="")
    concept_node = relationship("ConceptNode", back_populates="resources")
