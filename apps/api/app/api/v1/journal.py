"""MindCanvas API — Journal Router."""

import os
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.domain.schemas import JournalEntryCreate, JournalEntryUpdate

router = APIRouter(prefix="/journal", tags=["Journal"])


@router.get("")
async def list_journal_entries(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    mood: str = None,
    start_date: date = None,
    end_date: date = None,
    is_draft: bool = None,
    is_favorite: bool = None,
    search: str = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List journal entries with filters and pagination."""
    uid = str(current_user["id"])
    conditions = ["user_id = :user_id"]
    params = {"user_id": uid}

    if mood:
        conditions.append("mood = :mood")
        params["mood"] = mood
    if start_date:
        conditions.append("entry_date >= :start_date")
        params["start_date"] = start_date
    if end_date:
        conditions.append("entry_date <= :end_date")
        params["end_date"] = end_date
    if is_draft is not None:
        conditions.append("is_draft = :is_draft")
        params["is_draft"] = is_draft
    if is_favorite is not None:
        conditions.append("is_favorite = :is_favorite")
        params["is_favorite"] = is_favorite
    if search:
        conditions.append("(title ILIKE :search OR content ILIKE :search)")
        params["search"] = f"%{search}%"

    where = " AND ".join(conditions)
    offset = (page - 1) * page_size
    params["limit"] = page_size
    params["offset"] = offset

    # Count
    count_result = await db.execute(text(f"SELECT COUNT(*) FROM journal_entries WHERE {where}"), params)
    total = count_result.scalar()

    # Fetch
    result = await db.execute(
        text(f"SELECT * FROM journal_entries WHERE {where} ORDER BY entry_date DESC, created_at DESC LIMIT :limit OFFSET :offset"),
        params,
    )
    entries = [dict(row) for row in result.mappings().all()]

    return {"entries": entries, "total": total, "page": page, "page_size": page_size}


@router.get("/calendar")
async def journal_calendar(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get journal entry dates for a given month (calendar view)."""
    uid = str(current_user["id"])
    result = await db.execute(
        text("""
            SELECT entry_date, mood, is_favorite,
                   COALESCE(SUBSTRING(title, 1, 50), SUBSTRING(content, 1, 50)) AS preview
            FROM journal_entries
            WHERE user_id = :user_id
              AND EXTRACT(YEAR FROM entry_date) = :year
              AND EXTRACT(MONTH FROM entry_date) = :month
            ORDER BY entry_date
        """),
        {"user_id": uid, "year": year, "month": month},
    )
    return [dict(row) for row in result.mappings().all()]


@router.get("/{entry_id}")
async def get_journal_entry(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single journal entry with its media."""
    uid = str(current_user["id"])

    result = await db.execute(
        text("SELECT * FROM journal_entries WHERE id = :id AND user_id = :user_id"),
        {"id": entry_id, "user_id": uid},
    )
    entry = result.mappings().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    entry_dict = dict(entry)

    # Fetch media
    media_result = await db.execute(
        text("SELECT * FROM journal_media WHERE journal_id = :journal_id ORDER BY sort_order"),
        {"journal_id": entry_id},
    )
    entry_dict["media"] = [dict(m) for m in media_result.mappings().all()]

    return entry_dict


@router.post("", status_code=201)
async def create_journal_entry(
    req: JournalEntryCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new journal entry."""
    uid = str(current_user["id"])
    word_count = len((req.content or "").split()) if req.content else 0

    result = await db.execute(
        text("""
            INSERT INTO journal_entries (user_id, title, content, content_html, mood, energy_level,
                                         weather, location, is_draft, is_favorite, word_count, entry_date)
            VALUES (:user_id, :title, :content, :content_html, :mood, :energy_level,
                    :weather, :location, :is_draft, :is_favorite, :word_count, COALESCE(:entry_date, CURRENT_DATE))
            RETURNING *
        """),
        {
            "user_id": uid,
            "title": req.title,
            "content": req.content,
            "content_html": req.content_html,
            "mood": req.mood,
            "energy_level": req.energy_level,
            "weather": str(req.weather) if req.weather else None,
            "location": req.location,
            "is_draft": req.is_draft,
            "is_favorite": req.is_favorite,
            "word_count": word_count,
            "entry_date": req.entry_date,
        },
    )
    return dict(result.mappings().first())


@router.put("/{entry_id}")
async def update_journal_entry(
    entry_id: str,
    req: JournalEntryUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a journal entry."""
    uid = str(current_user["id"])
    updates = {k: v for k, v in req.model_dump().items() if v is not None and k != "tags"}

    if "content" in updates:
        updates["word_count"] = len(updates["content"].split())
    if "weather" in updates:
        updates["weather"] = str(updates["weather"])

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clause = ", ".join(f"{k} = :{k}" for k in updates)
    updates["id"] = entry_id
    updates["user_id"] = uid

    result = await db.execute(
        text(f"UPDATE journal_entries SET {set_clause} WHERE id = :id AND user_id = :user_id RETURNING *"),
        updates,
    )
    row = result.mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return dict(row)


@router.delete("/{entry_id}", status_code=204)
async def delete_journal_entry(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a journal entry."""
    uid = str(current_user["id"])
    result = await db.execute(
        text("DELETE FROM journal_entries WHERE id = :id AND user_id = :user_id RETURNING id"),
        {"id": entry_id, "user_id": uid},
    )
    if not result.first():
        raise HTTPException(status_code=404, detail="Journal entry not found")


@router.post("/{entry_id}/media", status_code=201)
async def upload_journal_media(
    entry_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload media (image/audio) to a journal entry."""
    uid = str(current_user["id"])

    # Verify journal belongs to user
    entry = await db.execute(
        text("SELECT id FROM journal_entries WHERE id = :id AND user_id = :user_id"),
        {"id": entry_id, "user_id": uid},
    )
    if not entry.first():
        raise HTTPException(status_code=404, detail="Journal entry not found")

    # Determine media type
    content_type = file.content_type or ""
    if content_type.startswith("image/"):
        m_type = "image"
    elif content_type.startswith("audio/"):
        m_type = "audio"
    else:
        m_type = "document"

    # Save file locally
    file_ext = os.path.splitext(file.filename or "file")[1]
    unique_name = f"{uuid.uuid4()}{file_ext}"
    user_dir = os.path.join(settings.upload_dir, uid)
    os.makedirs(user_dir, exist_ok=True)
    file_path = os.path.join(user_dir, unique_name)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Save record
    result = await db.execute(
        text("""
            INSERT INTO journal_media (journal_id, user_id, media_type, storage_path, file_name, file_size, mime_type)
            VALUES (:journal_id, :user_id, :media_type, :storage_path, :file_name, :file_size, :mime_type)
            RETURNING *
        """),
        {
            "journal_id": entry_id,
            "user_id": uid,
            "media_type": m_type,
            "storage_path": f"/uploads/{uid}/{unique_name}",
            "file_name": file.filename,
            "file_size": len(content),
            "mime_type": content_type,
        },
    )
    return dict(result.mappings().first())


@router.delete("/{entry_id}/media/{media_id}", status_code=204)
async def delete_journal_media(
    entry_id: str,
    media_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a media attachment from a journal entry."""
    uid = str(current_user["id"])
    result = await db.execute(
        text("DELETE FROM journal_media WHERE id = :id AND journal_id = :journal_id AND user_id = :user_id RETURNING storage_path"),
        {"id": media_id, "journal_id": entry_id, "user_id": uid},
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Media not found")

    # Try to delete file
    try:
        full_path = os.path.join(settings.upload_dir, "..", row[0].lstrip("/"))
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception:
        pass
