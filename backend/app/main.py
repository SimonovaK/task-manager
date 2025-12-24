from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import crud, models, schemas
from .database import SessionLocal, engine, init_db

init_db()

app = FastAPI(title="Task Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Task Manager API запущен"}

@app.get("/tasks", response_model=List[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = crud.get_tasks(db, skip=skip, limit=limit)
    response_tasks = []
    for task in tasks:
        task_dict = {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "is_done": task.is_done,
            "created_at": task.created_at,
            "deadline": task.deadline,
            "is_nearing_deadline": task.is_nearing_deadline()
        }
        response_tasks.append(task_dict)
    return response_tasks

@app.post("/tasks", response_model=schemas.Task, status_code=status.HTTP_201_CREATED)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    try:
        db_task = crud.create_task(db=db, task=task)
        response = {
            "id": db_task.id,
            "title": db_task.title,
            "description": db_task.description,
            "is_done": db_task.is_done,
            "created_at": db_task.created_at,
            "deadline": db_task.deadline,
            "is_nearing_deadline": db_task.is_nearing_deadline()
        }
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = crud.update_task(db=db, task_id=task_id, task_update=task_update)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    response = {
        "id": db_task.id,
        "title": db_task.title,
        "description": db_task.description,
        "is_done": db_task.is_done,
        "created_at": db_task.created_at,
        "deadline": db_task.deadline,
        "is_nearing_deadline": db_task.is_nearing_deadline()
    }
    return response

@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    success = crud.delete_task(db=db, task_id=task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return None