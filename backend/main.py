"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers.system import router as system_router
from routers.topics import router as topics_router
from scheduler import init_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB + scheduler. Shutdown: nothing special."""
    print("[App] Initializing database...")
    await init_db()
    print("[App] Database ready.")
    init_scheduler()
    print("[App] Scheduler started.")
    yield


app = FastAPI(
    title="StockPickr - 热点题材追踪",
    description="A-share hot topic tracker with industry chain analysis",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(topics_router)
app.include_router(system_router)


@app.get("/")
async def root():
    return {"message": "StockPickr API", "version": "0.1.0"}


@app.get("/api/health")
async def health():
    return {"status": "ok"}
