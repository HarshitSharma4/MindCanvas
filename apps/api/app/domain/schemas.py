"""MindCanvas API — Pydantic Domain Schemas."""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ── Auth ──────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    date_of_birth: Optional[date] = None
    timezone: Optional[str] = None
    country: Optional[str] = None
    profession: Optional[str] = None
    job_title: Optional[str] = None
    organization: Optional[str] = None
    bio: Optional[str] = None

class OnboardingRequest(BaseModel):
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    timezone: Optional[str] = None
    country: Optional[str] = None
    profession: Optional[str] = None
    currency: Optional[str] = "INR"
    theme: Optional[str] = "dark"
    goals: Optional[dict] = None
    interests: Optional[list[str]] = None
    skills: Optional[list[str]] = None

class PreferencesUpdate(BaseModel):
    currency: Optional[str] = None
    date_format: Optional[str] = None
    time_format: Optional[str] = None
    week_start: Optional[str] = None
    theme: Optional[str] = None
    daily_journal_reminder: Optional[bool] = None
    daily_motivation_enabled: Optional[bool] = None
    ai_enabled: Optional[bool] = None
    goals: Optional[dict] = None
    interests: Optional[list[str]] = None
    skills: Optional[list[str]] = None


# ── Journal ───────────────────────────────────────────────

class JournalEntryCreate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    content_html: Optional[str] = None
    mood: Optional[str] = None
    energy_level: Optional[int] = Field(None, ge=1, le=10)
    weather: Optional[dict] = None
    location: Optional[str] = None
    is_draft: bool = False
    is_favorite: bool = False
    entry_date: Optional[date] = None
    tags: Optional[list[str]] = None

class JournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    content_html: Optional[str] = None
    mood: Optional[str] = None
    energy_level: Optional[int] = Field(None, ge=1, le=10)
    weather: Optional[dict] = None
    location: Optional[str] = None
    is_draft: Optional[bool] = None
    is_favorite: Optional[bool] = None
    tags: Optional[list[str]] = None


# ── Ideas ─────────────────────────────────────────────────

class IdeaCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "captured"
    priority: str = "medium"
    tags: Optional[list[str]] = None

class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[list[str]] = None


# ── Projects ──────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    goal: Optional[str] = None
    status: str = "idea"
    priority: str = "medium"
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    color: Optional[str] = "#6366f1"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    goal: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    color: Optional[str] = None


# ── Tasks ─────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = "medium"
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_id: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurrence_rule: Optional[str] = None


# ── Finance ───────────────────────────────────────────────

class TransactionCreate(BaseModel):
    amount: float
    currency: str = "INR"
    type: str = "expense"
    category: str = "other"
    description: Optional[str] = None
    payment_method: Optional[str] = None
    transaction_date: Optional[date] = None

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None
    transaction_date: Optional[date] = None


# ── Learning ──────────────────────────────────────────────

class LearningItemCreate(BaseModel):
    title: str
    category: Optional[str] = None
    description: Optional[str] = None
    status: str = "not_started"
    target_date: Optional[date] = None
    resource_url: Optional[str] = None

class LearningItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[str] = None
    target_date: Optional[date] = None
    resource_url: Optional[str] = None
    notes: Optional[str] = None

class LearningSessionCreate(BaseModel):
    learning_item_id: Optional[str] = None
    topic: str
    duration_minutes: int = Field(gt=0)
    notes: Optional[str] = None
    session_date: Optional[date] = None


# ── Wellness ──────────────────────────────────────────────

class WellnessActivityCreate(BaseModel):
    type: str  # meditation, exercise, yoga, walking, etc.
    activity_name: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, gt=0)
    intensity: Optional[str] = None
    notes: Optional[str] = None
    activity_date: Optional[date] = None


# ── Personal Events ──────────────────────────────────────

class PersonalEventCreate(BaseModel):
    title: str
    person_name: Optional[str] = None
    relationship: Optional[str] = None
    event_date: date
    is_recurring: bool = True
    reminder_days_before: int = 1
    notes: Optional[str] = None

class PersonalEventUpdate(BaseModel):
    title: Optional[str] = None
    person_name: Optional[str] = None
    relationship: Optional[str] = None
    event_date: Optional[date] = None
    is_recurring: Optional[bool] = None
    reminder_days_before: Optional[int] = None
    notes: Optional[str] = None


# ── AI ────────────────────────────────────────────────────

class AIPromptRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context_type: Optional[str] = None  # journal, general, planning

class AIActionResponse(BaseModel):
    action_type: str
    action_payload: dict
    confidence: float
    requires_confirmation: bool = True
    message: str


# ── Search ────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str
    entity_types: Optional[list[str]] = None  # journal, ideas, projects, tasks, finance
    limit: int = Field(20, ge=1, le=100)


# ── Pagination ────────────────────────────────────────────

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
