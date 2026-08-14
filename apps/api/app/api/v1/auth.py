"""MindCanvas API — Auth Router."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.db.session import get_db
from app.domain.schemas import (
    RegisterRequest, LoginRequest, TokenResponse,
    ProfileUpdate, OnboardingRequest, PreferencesUpdate,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    # Check if email exists
    existing = await db.execute(
        text("SELECT id FROM profiles WHERE email = :email"), {"email": req.email}
    )
    if existing.first():
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create user
    result = await db.execute(
        text("""
            INSERT INTO profiles (email, password_hash, full_name)
            VALUES (:email, :password_hash, :full_name)
            RETURNING id, email, full_name, display_name, avatar_url, onboarding_completed
        """),
        {"email": req.email, "password_hash": hash_password(req.password), "full_name": req.full_name},
    )
    user = dict(result.mappings().first())

    # Create default preferences
    await db.execute(
        text("INSERT INTO user_preferences (user_id) VALUES (:user_id)"),
        {"user_id": str(user["id"])},
    )

    token = create_access_token(str(user["id"]))
    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate and return access token."""
    result = await db.execute(
        text("SELECT id, email, password_hash, full_name, display_name, avatar_url, onboarding_completed FROM profiles WHERE email = :email AND is_active = TRUE"),
        {"email": req.email},
    )
    row = result.mappings().first()
    if not row or not verify_password(req.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = {k: v for k, v in dict(row).items() if k != "password_hash"}
    token = create_access_token(str(user["id"]))
    return TokenResponse(access_token=token, user=user)


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile."""
    return current_user


@router.put("/profile")
async def update_profile(
    req: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's profile."""
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if not updates:
        return current_user

    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["user_id"] = str(current_user["id"])

    result = await db.execute(
        text(f"UPDATE profiles SET {set_clause} WHERE id = :user_id RETURNING id, email, full_name, display_name, avatar_url, onboarding_completed"),
        updates,
    )
    return dict(result.mappings().first())


@router.post("/onboarding")
async def complete_onboarding(
    req: OnboardingRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Complete user onboarding — sets profile and preferences."""
    uid = str(current_user["id"])

    # Update profile fields
    profile_fields = {k: v for k, v in req.model_dump().items()
                      if v is not None and k in ("full_name", "display_name", "timezone", "country", "profession")}
    if profile_fields:
        set_clause = ", ".join(f"{k} = :{k}" for k in profile_fields)
        profile_fields["user_id"] = uid
        await db.execute(text(f"UPDATE profiles SET {set_clause}, onboarding_completed = TRUE WHERE id = :user_id"), profile_fields)
    else:
        await db.execute(text("UPDATE profiles SET onboarding_completed = TRUE WHERE id = :user_id"), {"user_id": uid})

    # Update preferences
    pref_fields = {k: v for k, v in req.model_dump().items()
                   if v is not None and k in ("currency", "theme", "goals", "interests", "skills")}
    if pref_fields:
        set_parts = []
        for k in pref_fields:
            set_parts.append(f"{k} = :{k}")
        pref_fields["user_id"] = uid
        await db.execute(text(f"UPDATE user_preferences SET {', '.join(set_parts)} WHERE user_id = :user_id"), pref_fields)

    return {"status": "onboarding_completed"}


@router.put("/preferences")
async def update_preferences(
    req: PreferencesUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user preferences."""
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if not updates:
        return {"status": "no_changes"}

    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["user_id"] = str(current_user["id"])

    await db.execute(
        text(f"UPDATE user_preferences SET {set_clause} WHERE user_id = :user_id"),
        updates,
    )
    return {"status": "updated"}
