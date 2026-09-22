from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from database import Base

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime


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
