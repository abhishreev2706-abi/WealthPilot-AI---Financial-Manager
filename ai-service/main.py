from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, forecast, analyze

app = FastAPI(title="WealthPilot AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}
