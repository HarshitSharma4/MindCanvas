"""MindCanvas API — Dashboard Router."""

import random
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_current_user
from app.db.session import get_db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

QUOTES = [
    {"text": "Small progress compounds into remarkable results.", "cat": "discipline"},
    {"text": "Architecture is about knowing which trade-offs matter.", "cat": "engineering"},
    {"text": "Consistency beats intensity. Show up every day.", "cat": "discipline"},
    {"text": "The expert in anything was once a beginner.", "cat": "learning"},
    {"text": "Ship early, iterate often.", "cat": "engineering"},
    {"text": "Health is the foundation.", "cat": "wellness"},
    {"text": "Financial freedom starts with tracking every rupee.", "cat": "finance"},
    {"text": "Write honestly and you will see clearly.", "cat": "reflection"},
]


@router.get("")
async def get_dashboard(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    journal_r = await db.execute(text("SELECT id,title,mood,word_count FROM journal_entries WHERE user_id=:u AND entry_date=:t LIMIT 1"), {"u":uid,"t":today})
    today_journal = journal_r.mappings().first()

    streak_r = await db.execute(text("SELECT entry_date FROM journal_entries WHERE user_id=:u AND is_draft=FALSE ORDER BY entry_date DESC LIMIT 60"), {"u":uid})
    dates = [r[0] for r in streak_r.all()]
    streak, check = 0, today
    for d in dates:
        if d == check: streak += 1; check -= timedelta(days=1)
        elif d < check: break

    tasks_r = await db.execute(text("""SELECT COUNT(*) FILTER(WHERE status IN ('todo','in_progress')) AS pending,
        COUNT(*) FILTER(WHERE status='completed' AND completed_at::date=:t) AS done_today,
        COUNT(*) FILTER(WHERE due_date::date=:t AND status!='completed') AS due_today FROM tasks WHERE user_id=:u"""), {"u":uid,"t":today})
    tasks = dict(tasks_r.mappings().first())

    spend_r = await db.execute(text("SELECT COALESCE(SUM(amount),0) FROM financial_transactions WHERE user_id=:u AND type='expense' AND transaction_date=:t"), {"u":uid,"t":today})
    today_spend = float(spend_r.scalar())
    week_r = await db.execute(text("SELECT COALESCE(SUM(amount),0) FROM financial_transactions WHERE user_id=:u AND type='expense' AND transaction_date>=:w"), {"u":uid,"w":week_start})
    week_spend = float(week_r.scalar())

    learn_r = await db.execute(text("SELECT COALESCE(SUM(duration_minutes),0) FROM learning_sessions WHERE user_id=:u AND session_date=:t"), {"u":uid,"t":today})
    learn_today = int(learn_r.scalar())
    learn_w = await db.execute(text("SELECT COALESCE(SUM(duration_minutes),0) FROM learning_sessions WHERE user_id=:u AND session_date>=:w"), {"u":uid,"w":week_start})
    learn_week = int(learn_w.scalar())

    well_r = await db.execute(text("SELECT type,COALESCE(SUM(duration_minutes),0) AS mins FROM wellness_activities WHERE user_id=:u AND activity_date=:t GROUP BY type"), {"u":uid,"t":today})
    wellness = {r["type"]: int(r["mins"]) for r in well_r.mappings().all()}

    proj_r = await db.execute(text("SELECT id,name,progress,color FROM projects WHERE user_id=:u AND status='active' ORDER BY updated_at DESC LIMIT 5"), {"u":uid})
    projects = [dict(r) for r in proj_r.mappings().all()]

    evt_r = await db.execute(text("SELECT title,person_name,event_date FROM personal_events WHERE user_id=:u AND event_date>=:t ORDER BY event_date LIMIT 5"), {"u":uid,"t":today})
    events = [dict(r) for r in evt_r.mappings().all()]

    return {
        "greeting": {"display_name": current_user.get("display_name") or current_user.get("full_name",""), "date": str(today)},
        "motivation": random.choice(QUOTES),
        "journal": {"has_entry_today": today_journal is not None, "today_entry": dict(today_journal) if today_journal else None, "streak": streak},
        "tasks": tasks, "spending": {"today": today_spend, "this_week": week_spend},
        "learning": {"today_minutes": learn_today, "week_minutes": learn_week},
        "wellness": wellness, "active_projects": projects, "upcoming_events": events,
    }
