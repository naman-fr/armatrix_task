import json
import threading
from pathlib import Path
from typing import Optional, List, Dict, Any
from .models import TeamMember, TeamMemberCreate, TeamMemberUpdate
from datetime import datetime

DATA_FILE = Path(__file__).parent / "data.json"
_lock = threading.Lock()

def _now_iso():
    return datetime.utcnow().isoformat() + "Z"

def _read_file() -> Dict[str, Any]:
    if not DATA_FILE.exists():
        return {"team": [], "next_id": 1}
    with DATA_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)

def _write_file(obj: Dict[str, Any]) -> None:
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)

def get_all() -> List[Dict[str, Any]]:
    with _lock:
        obj = _read_file()
        return obj["team"]

def get_page(offset: int = 0, limit: int = 20, q: Optional[str] = None) -> Dict[str, Any]:
    """
    Return paginated results and total count. q is optional search string matched against name/role/skills.
    """
    with _lock:
        obj = _read_file()
        team = obj["team"]
        if q:
            ql = q.lower()
            def matches(m):
                if ql in m.get("name","").lower(): return True
                if ql in m.get("role","").lower(): return True
                if ql in m.get("bio","").lower(): return True
                for skill in m.get("skills", []):
                    if ql in skill.lower(): return True
                return False
            team = [m for m in team if matches(m)]
        total = len(team)
        sliced = team[offset: offset + limit]
        return {"total": total, "items": sliced, "limit": limit, "offset": offset}

def get_one(member_id: int) -> Optional[Dict[str, Any]]:
    with _lock:
        obj = _read_file()
        for m in obj["team"]:
            if m["id"] == member_id:
                return m
        return None

def create(member: TeamMemberCreate) -> TeamMember:
    with _lock:
        obj = _read_file()
        nid = obj.get("next_id", 1)
        item = member.dict()
        item["id"] = nid
        item["created_at"] = _now_iso()
        item["updated_at"] = _now_iso()
        obj["team"].append(item)
        obj["next_id"] = nid + 1
        _write_file(obj)
        return TeamMember(**item)

def update(member_id: int, member: TeamMemberCreate) -> Optional[TeamMember]:
    with _lock:
        obj = _read_file()
        for idx, m in enumerate(obj["team"]):
            if m["id"] == member_id:
                new_item = member.dict()
                new_item["id"] = member_id
                new_item["created_at"] = m.get("created_at", _now_iso())
                new_item["updated_at"] = _now_iso()
                obj["team"][idx] = new_item
                _write_file(obj)
                return TeamMember(**new_item)
        return None

def patch(member_id: int, partial: TeamMemberUpdate) -> Optional[TeamMember]:
    with _lock:
        obj = _read_file()
        for idx, m in enumerate(obj["team"]):
            if m["id"] == member_id:
                updated = {**m, **{k: v for k, v in partial.dict().items() if v is not None}}
                updated["updated_at"] = _now_iso()
                obj["team"][idx] = updated
                _write_file(obj)
                return TeamMember(**updated)
        return None

def delete(member_id: int) -> bool:
    with _lock:
        obj = _read_file()
        for idx, m in enumerate(obj["team"]):
            if m["id"] == member_id:
                obj["team"].pop(idx)
                _write_file(obj)
                return True
        return False