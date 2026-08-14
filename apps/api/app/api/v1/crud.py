"""MindCanvas API — CRUD routers for Ideas, Projects, Tasks, Finance, Learning, Wellness, Events, Search."""

from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_current_user
from app.db.session import get_db
from app.domain.schemas import (
    IdeaCreate, IdeaUpdate, ProjectCreate, ProjectUpdate,
    TaskCreate, TaskUpdate, TransactionCreate, TransactionUpdate,
    LearningItemCreate, LearningItemUpdate, LearningSessionCreate,
    WellnessActivityCreate, PersonalEventCreate, PersonalEventUpdate, SearchRequest,
)

# ── Ideas ─────────────────────────────────────────────────
ideas_router = APIRouter(prefix="/ideas", tags=["Ideas"])

@ideas_router.get("")
async def list_ideas(status: str = None, priority: str = None, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); conds = ["user_id=:u"]; p = {"u": uid}
    if status: conds.append("status=:s"); p["s"] = status
    if priority: conds.append("priority=:p"); p["p"] = priority
    w = " AND ".join(conds); p["lim"] = page_size; p["off"] = (page-1)*page_size
    cnt = await db.execute(text(f"SELECT COUNT(*) FROM ideas WHERE {w}"), p); total = cnt.scalar()
    r = await db.execute(text(f"SELECT * FROM ideas WHERE {w} ORDER BY created_at DESC LIMIT :lim OFFSET :off"), p)
    return {"ideas": [dict(row) for row in r.mappings().all()], "total": total}

@ideas_router.get("/{idea_id}")
async def get_idea(idea_id: str, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("SELECT * FROM ideas WHERE id=:id AND user_id=:u"), {"id": idea_id, "u": uid})
    row = r.mappings().first()
    if not row: raise HTTPException(404, "Idea not found")
    return dict(row)

@ideas_router.post("", status_code=201)
async def create_idea(req: IdeaCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("INSERT INTO ideas(user_id,title,description,status,priority) VALUES(:u,:t,:d,:s,:p) RETURNING *"),
        {"u":uid,"t":req.title,"d":req.description,"s":req.status,"p":req.priority})
    return dict(r.mappings().first())

@ideas_router.put("/{idea_id}")
async def update_idea(idea_id: str, req: IdeaUpdate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); ups = {k:v for k,v in req.model_dump().items() if v is not None and k != "tags"}
    if not ups: raise HTTPException(400, "No fields")
    sc = ", ".join(f"{k}=:{k}" for k in ups); ups["id"]=idea_id; ups["u"]=uid
    r = await db.execute(text(f"UPDATE ideas SET {sc} WHERE id=:id AND user_id=:u RETURNING *"), ups)
    row = r.mappings().first()
    if not row: raise HTTPException(404, "Idea not found")
    return dict(row)

@ideas_router.delete("/{idea_id}", status_code=204)
async def delete_idea(idea_id: str, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("DELETE FROM ideas WHERE id=:id AND user_id=:u RETURNING id"), {"id":idea_id,"u":uid})
    if not r.first(): raise HTTPException(404, "Idea not found")

# ── Projects ──────────────────────────────────────────────
projects_router = APIRouter(prefix="/projects", tags=["Projects"])

@projects_router.get("")
async def list_projects(status: str = None, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); conds = ["user_id=:u"]; p = {"u": uid}
    if status: conds.append("status=:s"); p["s"] = status
    r = await db.execute(text(f"SELECT * FROM projects WHERE {' AND '.join(conds)} ORDER BY updated_at DESC"), p)
    return [dict(row) for row in r.mappings().all()]

@projects_router.get("/{project_id}")
async def get_project(project_id: str, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("SELECT * FROM projects WHERE id=:id AND user_id=:u"), {"id":project_id,"u":uid})
    proj = r.mappings().first()
    if not proj: raise HTTPException(404, "Project not found")
    p = dict(proj)
    tr = await db.execute(text("SELECT * FROM tasks WHERE project_id=:pid ORDER BY sort_order"), {"pid":project_id})
    p["tasks"] = [dict(t) for t in tr.mappings().all()]
    return p

@projects_router.post("", status_code=201)
async def create_project(req: ProjectCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("INSERT INTO projects(user_id,name,description,goal,status,priority,start_date,target_date,color) VALUES(:u,:n,:d,:g,:s,:p,:sd,:td,:c) RETURNING *"),
        {"u":uid,"n":req.name,"d":req.description,"g":req.goal,"s":req.status,"p":req.priority,"sd":req.start_date,"td":req.target_date,"c":req.color})
    return dict(r.mappings().first())

@projects_router.put("/{project_id}")
async def update_project(project_id: str, req: ProjectUpdate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); ups = {k:v for k,v in req.model_dump().items() if v is not None}
    if not ups: raise HTTPException(400, "No fields")
    sc = ", ".join(f"{k}=:{k}" for k in ups); ups["id"]=project_id; ups["u"]=uid
    r = await db.execute(text(f"UPDATE projects SET {sc} WHERE id=:id AND user_id=:u RETURNING *"), ups)
    row = r.mappings().first()
    if not row: raise HTTPException(404, "Project not found")
    return dict(row)

@projects_router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(text("DELETE FROM projects WHERE id=:id AND user_id=:u RETURNING id"), {"id":project_id,"u":str(current_user["id"])})
    if not r.first(): raise HTTPException(404, "Project not found")

# ── Tasks ─────────────────────────────────────────────────
tasks_router = APIRouter(prefix="/tasks", tags=["Tasks"])

@tasks_router.get("")
async def list_tasks(status: str = None, project_id: str = None, priority: str = None, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); conds = ["user_id=:u"]; p = {"u": uid}
    if status: conds.append("status=:s"); p["s"] = status
    if project_id: conds.append("project_id=:pid"); p["pid"] = project_id
    if priority: conds.append("priority=:pr"); p["pr"] = priority
    r = await db.execute(text(f"SELECT * FROM tasks WHERE {' AND '.join(conds)} ORDER BY sort_order, due_date ASC NULLS LAST"), p)
    return [dict(row) for row in r.mappings().all()]

@tasks_router.post("", status_code=201)
async def create_task(req: TaskCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("INSERT INTO tasks(user_id,project_id,title,description,due_date,priority,is_recurring,recurrence_rule) VALUES(:u,:pid,:t,:d,:dd,:p,:ir,:rr) RETURNING *"),
        {"u":uid,"pid":req.project_id,"t":req.title,"d":req.description,"dd":req.due_date,"p":req.priority,"ir":req.is_recurring,"rr":req.recurrence_rule})
    return dict(r.mappings().first())

@tasks_router.put("/{task_id}")
async def update_task(task_id: str, req: TaskUpdate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); ups = {k:v for k,v in req.model_dump().items() if v is not None}
    if ups.get("status") == "completed":
        ups["completed_at"] = "NOW()"
    if not ups: raise HTTPException(400, "No fields")
    parts = []
    for k in ups:
        if k == "completed_at": parts.append("completed_at=NOW()")
        else: parts.append(f"{k}=:{k}")
    if "completed_at" in ups: del ups["completed_at"]
    ups["id"]=task_id; ups["u"]=uid
    r = await db.execute(text(f"UPDATE tasks SET {', '.join(parts)} WHERE id=:id AND user_id=:u RETURNING *"), ups)
    row = r.mappings().first()
    if not row: raise HTTPException(404, "Task not found")
    return dict(row)

@tasks_router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(text("DELETE FROM tasks WHERE id=:id AND user_id=:u RETURNING id"), {"id":task_id,"u":str(current_user["id"])})
    if not r.first(): raise HTTPException(404, "Task not found")

# ── Finance ───────────────────────────────────────────────
finance_router = APIRouter(prefix="/finance", tags=["Finance"])

@finance_router.get("")
async def list_transactions(type: str = None, category: str = None, start_date: date = None, end_date: date = None,
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); conds = ["user_id=:u"]; p = {"u": uid}
    if type: conds.append("type=:t"); p["t"] = type
    if category: conds.append("category=:c"); p["c"] = category
    if start_date: conds.append("transaction_date>=:sd"); p["sd"] = start_date
    if end_date: conds.append("transaction_date<=:ed"); p["ed"] = end_date
    w = " AND ".join(conds); p["lim"]=page_size; p["off"]=(page-1)*page_size
    cnt = await db.execute(text(f"SELECT COUNT(*) FROM financial_transactions WHERE {w}"), p); total = cnt.scalar()
    r = await db.execute(text(f"SELECT * FROM financial_transactions WHERE {w} ORDER BY transaction_date DESC LIMIT :lim OFFSET :off"), p)
    return {"transactions": [dict(row) for row in r.mappings().all()], "total": total}

@finance_router.get("/summary")
async def finance_summary(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); today = date.today()
    r = await db.execute(text("""SELECT
        COALESCE(SUM(amount) FILTER(WHERE type='expense' AND transaction_date=:t),0) AS today_expense,
        COALESCE(SUM(amount) FILTER(WHERE type='expense' AND transaction_date>=:m),0) AS month_expense,
        COALESCE(SUM(amount) FILTER(WHERE type='income' AND transaction_date>=:m),0) AS month_income
        FROM financial_transactions WHERE user_id=:u"""), {"u":uid,"t":today,"m":today.replace(day=1)})
    s = dict(r.mappings().first())
    cat_r = await db.execute(text("SELECT category,SUM(amount) AS total FROM financial_transactions WHERE user_id=:u AND type='expense' AND transaction_date>=:m GROUP BY category ORDER BY total DESC"),
        {"u":uid,"m":today.replace(day=1)})
    s["categories"] = [dict(c) for c in cat_r.mappings().all()]
    return s

@finance_router.post("", status_code=201)
async def create_transaction(req: TransactionCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("INSERT INTO financial_transactions(user_id,amount,currency,type,category,description,payment_method,transaction_date) VALUES(:u,:a,:cur,:t,:c,:d,:pm,COALESCE(:td,CURRENT_DATE)) RETURNING *"),
        {"u":uid,"a":req.amount,"cur":req.currency,"t":req.type,"c":req.category,"d":req.description,"pm":req.payment_method,"td":req.transaction_date})
    return dict(r.mappings().first())

@finance_router.delete("/{txn_id}", status_code=204)
async def delete_transaction(txn_id: str, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(text("DELETE FROM financial_transactions WHERE id=:id AND user_id=:u RETURNING id"), {"id":txn_id,"u":str(current_user["id"])})
    if not r.first(): raise HTTPException(404, "Transaction not found")

# ── Learning ──────────────────────────────────────────────
learning_router = APIRouter(prefix="/learning", tags=["Learning"])

@learning_router.get("/items")
async def list_learning_items(status: str = None, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); conds = ["user_id=:u"]; p = {"u": uid}
    if status: conds.append("status=:s"); p["s"] = status
    r = await db.execute(text(f"SELECT * FROM learning_items WHERE {' AND '.join(conds)} ORDER BY updated_at DESC"), p)
    return [dict(row) for row in r.mappings().all()]

@learning_router.post("/items", status_code=201)
async def create_learning_item(req: LearningItemCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("INSERT INTO learning_items(user_id,title,category,description,status,target_date,resource_url) VALUES(:u,:t,:c,:d,:s,:td,:ru) RETURNING *"),
        {"u":uid,"t":req.title,"c":req.category,"d":req.description,"s":req.status,"td":req.target_date,"ru":req.resource_url})
    return dict(r.mappings().first())

@learning_router.put("/items/{item_id}")
async def update_learning_item(item_id: str, req: LearningItemUpdate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); ups = {k:v for k,v in req.model_dump().items() if v is not None}
    if not ups: raise HTTPException(400, "No fields")
    sc = ", ".join(f"{k}=:{k}" for k in ups); ups["id"]=item_id; ups["u"]=uid
    r = await db.execute(text(f"UPDATE learning_items SET {sc} WHERE id=:id AND user_id=:u RETURNING *"), ups)
    row = r.mappings().first()
    if not row: raise HTTPException(404, "Learning item not found")
    return dict(row)

@learning_router.get("/sessions")
async def list_sessions(start_date: date = None, end_date: date = None, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); conds = ["user_id=:u"]; p = {"u": uid}
    if start_date: conds.append("session_date>=:sd"); p["sd"] = start_date
    if end_date: conds.append("session_date<=:ed"); p["ed"] = end_date
    r = await db.execute(text(f"SELECT * FROM learning_sessions WHERE {' AND '.join(conds)} ORDER BY session_date DESC LIMIT 50"), p)
    return [dict(row) for row in r.mappings().all()]

@learning_router.post("/sessions", status_code=201)
async def create_session(req: LearningSessionCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("INSERT INTO learning_sessions(user_id,learning_item_id,topic,duration_minutes,notes,session_date) VALUES(:u,:li,:t,:d,:n,COALESCE(:sd,CURRENT_DATE)) RETURNING *"),
        {"u":uid,"li":req.learning_item_id,"t":req.topic,"d":req.duration_minutes,"n":req.notes,"sd":req.session_date})
    return dict(r.mappings().first())

# ── Wellness ──────────────────────────────────────────────
wellness_router = APIRouter(prefix="/wellness", tags=["Wellness"])

@wellness_router.get("")
async def list_wellness(type: str = None, start_date: date = None, end_date: date = None, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); conds = ["user_id=:u"]; p = {"u": uid}
    if type: conds.append("type=:t"); p["t"] = type
    if start_date: conds.append("activity_date>=:sd"); p["sd"] = start_date
    if end_date: conds.append("activity_date<=:ed"); p["ed"] = end_date
    r = await db.execute(text(f"SELECT * FROM wellness_activities WHERE {' AND '.join(conds)} ORDER BY activity_date DESC LIMIT 50"), p)
    return [dict(row) for row in r.mappings().all()]

@wellness_router.post("", status_code=201)
async def create_wellness(req: WellnessActivityCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("INSERT INTO wellness_activities(user_id,type,activity_name,duration_minutes,intensity,notes,activity_date) VALUES(:u,:t,:an,:dm,:i,:n,COALESCE(:ad,CURRENT_DATE)) RETURNING *"),
        {"u":uid,"t":req.type,"an":req.activity_name,"dm":req.duration_minutes,"i":req.intensity,"n":req.notes,"ad":req.activity_date})
    return dict(r.mappings().first())

# ── Events ────────────────────────────────────────────────
events_router = APIRouter(prefix="/events", tags=["Events"])

@events_router.get("")
async def list_events(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("SELECT * FROM personal_events WHERE user_id=:u ORDER BY event_date"), {"u": uid})
    return [dict(row) for row in r.mappings().all()]

@events_router.post("", status_code=201)
async def create_event(req: PersonalEventCreate, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"])
    r = await db.execute(text("INSERT INTO personal_events(user_id,title,person_name,relationship,event_date,is_recurring,reminder_days_before,notes) VALUES(:u,:t,:pn,:rel,:ed,:ir,:rdb,:n) RETURNING *"),
        {"u":uid,"t":req.title,"pn":req.person_name,"rel":req.relationship,"ed":req.event_date,"ir":req.is_recurring,"rdb":req.reminder_days_before,"n":req.notes})
    return dict(r.mappings().first())

@events_router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: str, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = await db.execute(text("DELETE FROM personal_events WHERE id=:id AND user_id=:u RETURNING id"), {"id":event_id,"u":str(current_user["id"])})
    if not r.first(): raise HTTPException(404, "Event not found")

# ── Search ────────────────────────────────────────────────
search_router = APIRouter(prefix="/search", tags=["Search"])

@search_router.get("")
async def global_search(q: str = Query(..., min_length=1), current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    uid = str(current_user["id"]); pattern = f"%{q}%"; results = []
    jr = await db.execute(text("SELECT id,'journal' AS type,title,SUBSTRING(content,1,100) AS preview,entry_date AS date FROM journal_entries WHERE user_id=:u AND (title ILIKE :p OR content ILIKE :p) LIMIT 5"), {"u":uid,"p":pattern})
    results.extend([dict(r) for r in jr.mappings().all()])
    ir = await db.execute(text("SELECT id,'idea' AS type,title,SUBSTRING(description,1,100) AS preview,created_at AS date FROM ideas WHERE user_id=:u AND (title ILIKE :p OR description ILIKE :p) LIMIT 5"), {"u":uid,"p":pattern})
    results.extend([dict(r) for r in ir.mappings().all()])
    pr = await db.execute(text("SELECT id,'project' AS type,name AS title,SUBSTRING(description,1,100) AS preview,created_at AS date FROM projects WHERE user_id=:u AND (name ILIKE :p OR description ILIKE :p) LIMIT 5"), {"u":uid,"p":pattern})
    results.extend([dict(r) for r in pr.mappings().all()])
    tr = await db.execute(text("SELECT id,'task' AS type,title,SUBSTRING(description,1,100) AS preview,created_at AS date FROM tasks WHERE user_id=:u AND (title ILIKE :p OR description ILIKE :p) LIMIT 5"), {"u":uid,"p":pattern})
    results.extend([dict(r) for r in tr.mappings().all()])
    fr = await db.execute(text("SELECT id,'finance' AS type,description AS title,CONCAT(type,' ',amount,' ',currency) AS preview,transaction_date AS date FROM financial_transactions WHERE user_id=:u AND description ILIKE :p LIMIT 5"), {"u":uid,"p":pattern})
    results.extend([dict(r) for r in fr.mappings().all()])
    return {"results": results, "query": q}
