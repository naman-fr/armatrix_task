from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from datetime import datetime

def now_iso():
    return datetime.utcnow().isoformat() + "Z"

class TeamMemberBase(BaseModel):
    name: str = Field(..., example="Ava-Unit 7")
    role: str = Field(..., example="AI Systems Engineer")
    bio: Optional[str] = Field("", example="Builds perception stacks and neural control for autonomous agents.")
    photo_url: Optional[HttpUrl] = Field(None, example="https://robohash.org/ava-unit-7.png")
    linkedin: Optional[HttpUrl] = Field(None, example="https://linkedin.com/in/example")
    skills: Optional[List[str]] = Field(default_factory=list)

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberUpdate(BaseModel):
    # Allow partial updates
    name: Optional[str]
    role: Optional[str]
    bio: Optional[str]
    photo_url: Optional[HttpUrl]
    linkedin: Optional[HttpUrl]
    skills: Optional[List[str]]

class TeamMember(TeamMemberBase):
    id: int
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)