from sqlalchemy import BigInteger, Integer, String, Text, Boolean, TIMESTAMP, CheckConstraint, ForeignKey, ARRAY, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime
from app.database import Base

class Guild(Base):
    __tablename__ = "guilds"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=True)
    default_welcome_channel: Mapped[int] = mapped_column(BigInteger, nullable=True)
    prefix: Mapped[str] = mapped_column(Text, nullable=True, default="!")
    xp_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    xp_rate: Mapped[int] = mapped_column(Integer, default=10)
    welcome_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    leave_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    moderation_log_channel: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

class Channel(Base):
    __tablename__ = "channels"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    guild_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("guilds.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(Text, nullable=True)

class WelcomeBanner(Base):
    __tablename__ = "welcome_banners"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guild_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("guilds.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(Text, nullable=True)
    channel_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    text: Mapped[str] = mapped_column(Text, nullable=True)
    media_path: Mapped[str] = mapped_column(Text, nullable=True)
    mention_channels: Mapped[dict] = mapped_column(JSON, nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[int] = mapped_column(BigInteger, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

class LeaveBanner(Base):
    __tablename__ = "leave_banners"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guild_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("guilds.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(Text, nullable=True)
    channel_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    text: Mapped[str] = mapped_column(Text, nullable=True)
    media_path: Mapped[str] = mapped_column(Text, nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[int] = mapped_column(BigInteger, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

class MinecraftServer(Base):
    __tablename__ = "minecraft_servers"
    __table_args__ = (CheckConstraint("type IN ('java', 'bedrock')", name="check_server_type"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guild_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("guilds.id"))
    name: Mapped[str] = mapped_column(Text, nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    port: Mapped[int] = mapped_column(Integer, nullable=True)
    type: Mapped[str] = mapped_column(Text, nullable=True)
    alt_addresses: Mapped[dict] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

class VoteLink(Base):
    __tablename__ = "vote_links"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guild_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("guilds.id", ondelete="CASCADE"))
    url: Mapped[str] = mapped_column(Text, nullable=False)
    site_name: Mapped[str] = mapped_column(Text, nullable=False)
    rewards: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

class Broadcast(Base):
    __tablename__ = "broadcasts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guild_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("guilds.id"))
    author_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=True)
    media_path: Mapped[str] = mapped_column(Text, nullable=True)
    target_channel_ids: Mapped[list] = mapped_column(ARRAY(BigInteger), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

class XP(Base):
    __tablename__ = "xp"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    guild_id: Mapped[int] = mapped_column(BigInteger)
    user_id: Mapped[int] = mapped_column(BigInteger)
    xp: Mapped[int] = mapped_column(BigInteger, default=0)
    level: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

class ModerationLog(Base):
    __tablename__ = "moderation_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guild_id: Mapped[int] = mapped_column(BigInteger)
    mod_id: Mapped[int] = mapped_column(BigInteger)
    target_id: Mapped[int] = mapped_column(BigInteger)
    action: Mapped[str] = mapped_column(Text)
    reason: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

class Media(Base):
    __tablename__ = "media"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    guild_id: Mapped[int] = mapped_column(BigInteger)
    uploader_id: Mapped[int] = mapped_column(BigInteger)
    path: Mapped[str] = mapped_column(Text)
    filename: Mapped[str] = mapped_column(Text)
    mime: Mapped[str] = mapped_column(Text)
    uploaded_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
