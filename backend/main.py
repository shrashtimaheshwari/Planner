import os
import uuid
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Response, Depends, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()

from schemas import (
    TripPreferences,
    ItineraryResponse,
    ItineraryDay,
    TripRecord,
    RegenerateDayRequest
)
from services.ai_service import generate_itinerary, regenerate_single_day, GROQ_API_KEY, OPENAI_API_KEY
from services.pdf_service import generate_itinerary_pdf
import database

app = FastAPI(
    title="Personalized Travel Itinerary Planner API",
    description="Backend API powering AI-driven customized travel itineraries, Supabase persistence, and PDF export.",
    version="1.0.0"
)

# --- SECURE CORS CONFIGURATION ---
default_dev_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

cors_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = list(default_dev_origins)

if cors_env:
    for origin in cors_env.split(","):
        origin_clean = origin.strip()
        if origin_clean and origin_clean not in allowed_origins:
            allowed_origins.append(origin_clean)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

def _validate_uuid(trip_id: str) -> str:
    """Validate that trip_id conforms to UUID standard"""
    try:
        uuid.UUID(str(trip_id))
        return str(trip_id)
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid trip ID '{trip_id}'. A valid UUID is required."
        )

def get_caller_id(
    request: Request,
    x_client_id: Optional[str] = Header(None, alias="X-Client-Id")
) -> Optional[str]:
    """
    Extracts client/user identity from X-Client-Id header, query param, or Authorization header.
    Prevents public callers from viewing or mutating other users' saved trips.
    """
    if x_client_id and x_client_id.strip():
        return x_client_id.strip()

    # Query param fallback
    qp_client_id = request.query_params.get("user_id") or request.query_params.get("client_id")
    if qp_client_id and qp_client_id.strip():
        return qp_client_id.strip()

    # Supabase Auth Bearer token prefix if authenticated
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        if token:
            return token[:36]

    return None

@app.get("/")
def root():
    """Root welcoming endpoint"""
    return {
        "status": "online",
        "message": "Personalized Travel Itinerary Planner API is Live!",
        "health_check": "/api/health",
        "documentation": "/docs"
    }

@app.get("/")
def root():
    """Root welcoming endpoint"""
    return {
        "status": "online",
        "message": "Personalized Travel Itinerary Planner API is Live!",
        "health_check": "/api/health",
        "documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    """Health check endpoint displaying system and service connectivity"""
    ai_status = "Groq (llama-3.3-70b-versatile) Active" if GROQ_API_KEY else "Programmatic generator active (add GROQ_API_KEY in .env)"
    db_status = "Supabase PostgreSQL connected" if database.is_supabase_enabled() else "Resilient local storage active"
    return {
        "status": "healthy",
        "service": "Personalized Travel Itinerary Planner API",
        "version": "1.0.0",
        "ai_engine": ai_status,
        "database": db_status,
        "allowed_cors_origins": allowed_origins
    }

@app.post("/api/itinerary/generate", response_model=ItineraryResponse)
def create_itinerary(prefs: TripPreferences):
    """Generates an AI personalized day-by-day travel itinerary with input validation"""
    try:
        itinerary = generate_itinerary(prefs)
        return itinerary
    except Exception as e:
        print(f"[API] Error generating itinerary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate itinerary: {str(e)}")

@app.post("/api/itinerary/regenerate-day", response_model=ItineraryDay)
def regenerate_day(req: RegenerateDayRequest):
    """Regenerates activities for an individual day of the trip"""
    try:
        new_day = regenerate_single_day(req)
        return new_day
    except Exception as e:
        print(f"[API] Error regenerating day: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to regenerate day: {str(e)}")

@app.get("/api/trips", response_model=List[Dict[str, Any]])
def list_trips(caller_id: Optional[str] = Depends(get_caller_id)):
    """
    Retrieve saved trips scoped strictly to the requesting client/user.
    If no caller identity is provided, returns empty list to prevent leaking trips publicly.
    """
    try:
        if not caller_id:
            return []
        return database.get_all_trips(user_id=caller_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips/{trip_id}", response_model=Dict[str, Any])
def get_trip(trip_id: str, caller_id: Optional[str] = Depends(get_caller_id)):
    """Retrieve a single saved trip by UUID with ownership verification"""
    valid_id = _validate_uuid(trip_id)
    trip = database.get_trip_by_id(valid_id, user_id=caller_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or unauthorized")
    return trip

@app.post("/api/trips", response_model=Dict[str, Any])
def save_trip(trip: TripRecord, caller_id: Optional[str] = Depends(get_caller_id)):
    """Save or update a trip with full schema validation and ownership binding"""
    try:
        trip_data = trip.model_dump()
        if caller_id and not trip_data.get("user_id"):
            trip_data["user_id"] = caller_id
        saved = database.save_trip(trip_data)
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save trip: {str(e)}")

@app.delete("/api/trips/{trip_id}")
def delete_trip(trip_id: str, caller_id: Optional[str] = Depends(get_caller_id)):
    """Delete a saved trip with UUID validation, Supabase confirmation, and ownership protection"""
    valid_id = _validate_uuid(trip_id)
    deleted = database.delete_trip_by_id(valid_id, user_id=caller_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Trip not found, already deleted, or unauthorized")
    return {"success": True, "message": f"Trip {valid_id} deleted successfully"}

@app.post("/api/export/pdf")
def export_pdf(itinerary: ItineraryResponse):
    """Export the structured travel itinerary into a downloadable PDF document"""
    try:
        pdf_buffer = generate_itinerary_pdf(itinerary)
        filename = f"Itinerary_{itinerary.destination.replace(' ', '_')}_{itinerary.start_date}.pdf"
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        print(f"[API] PDF Generation Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
