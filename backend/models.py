from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from database import Base


class Admin(Base):

    __tablename__ = "admins"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String(100),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )


class AdminSession(Base):

    __tablename__ = "admin_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    token_hash = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True
    )

    admin_id = Column(
        Integer,
        ForeignKey("admins.id", ondelete="CASCADE"),
        nullable=False
    )

    expires_at = Column(
        DateTime,
        nullable=False
    )


class News(Base):

    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    description = Column(Text, nullable=False)

    content = Column(Text, nullable=False)

    category = Column(String(50), nullable=False)

    date = Column(String(50), nullable=False)

    image = Column(String(255), nullable=True)

    images = relationship(
        "NewsImage",
        back_populates="news",
        cascade="all, delete"
    )


class NewsImage(Base):

    __tablename__ = "news_images"

    id = Column(Integer, primary_key=True, index=True)

    news_id = Column(
        Integer,
        ForeignKey("news.id"),
        nullable=False
    )

    image = Column(
        String(255),
        nullable=False
    )

    news = relationship(
        "News",
        back_populates="images"
    )


class LoginAttempt(Base):

    __tablename__ = "login_attempts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String(100),
        nullable=False,
        index=True
    )

    ip_address = Column(
        String(45),
        nullable=False,
        index=True
    )

    failed_attempts = Column(
        Integer,
        nullable=False,
        default=0
    )

    blocked_until = Column(
        DateTime,
        nullable=True
    )


class Teacher(Base):

    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)

    last_name = Column(String(100), nullable=False)

    first_name = Column(String(100), nullable=False)

    middle_name = Column(String(100), nullable=False)

    photo = Column(String(255), nullable=False)

    position = Column(String(255), nullable=False)

    category = Column(String(64), nullable=False, default="other", index=True)

    classroom_guidance = Column(String(150), nullable=True)

    experience_years = Column(Integer, nullable=True)

    qualification = Column(String(150), nullable=True)

    sort_order = Column(Integer, nullable=False, default=0, index=True)


class SchoolClass(Base):

    __tablename__ = "school_classes"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(32), unique=True, nullable=False, index=True)

    grade = Column(Integer, nullable=True, index=True)

    building = Column(String(32), nullable=False, default="pokrovsky", index=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
    )

    lessons = relationship(
        "ScheduleLesson",
        back_populates="school_class",
        cascade="all, delete-orphan",
    )


class ScheduleLesson(Base):

    __tablename__ = "schedule_lessons"

    id = Column(Integer, primary_key=True, index=True)

    class_id = Column(
        Integer,
        ForeignKey("school_classes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    day_of_week = Column(String(16), nullable=False, index=True)

    lesson_number = Column(Integer, nullable=False)

    subject = Column(String(150), nullable=False)

    start_time = Column(String(5), nullable=False)

    end_time = Column(String(5), nullable=False)

    room = Column(String(64), nullable=True)

    teacher_id = Column(
        Integer,
        ForeignKey("teachers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    period = Column(String(64), nullable=False, default="main", index=True)

    sort_order = Column(Integer, nullable=False, default=0, index=True)

    school_class = relationship("SchoolClass", back_populates="lessons")

    teacher = relationship("Teacher")
