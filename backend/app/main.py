import os
import logging
from fastapi import FastAPI, HTTPException, status, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from .models import TeamMember, TeamMemberCreate, TeamMemberUpdate
from . import storage

# Basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("team-api")

app = FastAPI(
    title="Armatrix Team API (Robotic Theme)",
    description="CRUD + search + pagination for team members. Demo API for a Team Page.",
    version="1.1.0",
)

# allow origins from env or all for demo
origins = [
    "https://armatrix-task.vercel.app",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/healthz", status_code=200)
def healthz():
    return {"status": "ok"}

@app.get("/team", response_model=List[TeamMember])
def list_team(q: Optional[str] = Query(None, description="search query (name, role, skills)"),
              offset: int = Query(0, ge=0),
              limit: int = Query(20, ge=1, le=100)):
    """
    Returns all team members (paginated). Use q to search.
    Example: /team?q=ai&offset=0&limit=10
    """
    page = storage.get_page(offset=offset, limit=limit, q=q)
    # we return items only for the standard /team contract; metadata available on /team/meta
    return page["items"]

@app.get("/team/meta")
def team_meta(q: Optional[str] = Query(None), offset: int = Query(0), limit: int = Query(20)):
    page = storage.get_page(offset=offset, limit=limit, q=q)
    return page

@app.get("/team/{member_id}", response_model=TeamMember)
def get_member(member_id: int):
    m = storage.get_one(member_id)
    if not m:
        logger.info("Member not found: %s", member_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return m

@app.post("/team", response_model=TeamMember, status_code=status.HTTP_201_CREATED)
def create_member(member: TeamMemberCreate):
    created = storage.create(member)
    logger.info("Created member id=%s name=%s", created.id, created.name)
    return created

@app.put("/team/{member_id}", response_model=TeamMember)
def update_member(member_id: int, member: TeamMemberCreate):
    updated = storage.update(member_id, member)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    logger.info("Updated member id=%s", member_id)
    return updated

@app.patch("/team/{member_id}", response_model=TeamMember)
def patch_member(member_id: int, patch: TeamMemberUpdate = Body(...)):
    updated = storage.patch(member_id, patch)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    logger.info("Patched member id=%s", member_id)
    return updated

@app.delete("/team/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int):
    ok = storage.delete(member_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    logger.info("Deleted member id=%s", member_id)
    return None