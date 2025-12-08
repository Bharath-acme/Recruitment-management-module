from sqlalchemy.orm import Session
from . import schemas
from app.models import Skill

def get_skill_by_name(db: Session, name: str):
    return db.query(Skill).filter(Skill.name == name).first()

def create_skill(db: Session, skill: schemas.SkillCreate):
    db_skill = Skill(name=skill.name)
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

def get_or_create_skill(db: Session, skill_name: str) -> Skill:
    db_skill = get_skill_by_name(db, name=skill_name)
    if db_skill:
        return db_skill
    return create_skill(db, skill=schemas.SkillCreate(name=skill_name))

def search_skills(db: Session, query: str, skip: int = 0, limit: int = 100):
    return db.query(Skill).filter(Skill.name.ilike(f"%{query}%")).offset(skip).limit(limit).all()

