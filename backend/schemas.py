from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date

class TripPreferences(BaseModel):
    destination: str = Field(..., description="Target travel destination city or region")
    starting_location: Optional[str] = Field(None, description="Starting departure city")
    start_date: str = Field(..., description="Trip start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="Trip end date (YYYY-MM-DD)")
    budget: float = Field(..., gt=0, description="Total budget amount")
    currency: str = Field("INR", description="Currency symbol or 3-letter code (default INR)")
    travelers_count: int = Field(1, ge=1, description="Number of travelers")
    traveler_type: str = Field("solo", description="solo, couple, family, or group")
    travel_interests: List[str] = Field(default_factory=list, description="List of interests")
    travel_pace: str = Field("balanced", description="relaxed, balanced, or packed")
    accommodation_preference: Optional[str] = Field("Mid-range Hotel", description="Style of accommodation")
    dietary_preferences: Optional[str] = Field("No restrictions", description="Dietary requirements")
    additional_instructions: Optional[str] = Field(None, description="Any specific requests or constraints")
    vibe: Optional[str] = Field("balanced", description="Trip vibe e.g., romantic, adventurous, cultural, luxury")

class ActivityItem(BaseModel):
    id: Optional[str] = None
    period: str = Field(..., description="morning, afternoon, or evening")
    time: str = Field(..., description="Estimated time slot, e.g. 09:30 AM - 11:30 AM")
    title: str = Field(..., description="Name of attraction, activity, or venue")
    description: str = Field(..., description="Short engaging description of what to do")
    category: str = Field("sightseeing", description="sightseeing, food, culture, nature, relaxation, adventure, nightlife")
    estimated_duration: str = Field(..., description="Estimated duration, e.g. 2 hours")
    estimated_cost: float = Field(0.0, description="Estimated cost per person or total")
    transport_tip: Optional[str] = Field(None, description="Sensible transportation recommendation & travel time estimate")
    dining_recommendation: Optional[str] = Field(None, description="Nearby dining option or snack recommendation")
    notes: Optional[str] = Field(None, description="Helpful tips (e.g. booking advance, best view)")

class ItineraryDay(BaseModel):
    day_number: int
    date: str
    theme: Optional[str] = Field(None, description="Short theme for the day e.g., Historic Old Town Discovery")
    activities: List[ActivityItem]
    estimated_daily_cost: float = 0.0
    accommodation_suggestion: Optional[str] = None

class ItineraryResponse(BaseModel):
    title: str
    destination: str
    start_date: str
    end_date: str
    total_days: int
    budget: float
    currency: str
    estimated_total_cost: float
    vibe: str
    traveler_type: str
    travelers_count: int
    days: List[ItineraryDay]
    planning_tips: List[str] = Field(default_factory=list)
    budget_breakdown: Optional[Dict[str, float]] = None

class TripRecord(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    title: str
    destination: str
    start_date: str
    end_date: str
    budget: float
    currency: str
    travelers_count: int
    traveler_type: str
    preferences: Dict[str, Any]
    vibe: str
    itinerary: ItineraryResponse
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class RegenerateDayRequest(BaseModel):
    trip_id: Optional[str] = None
    day_number: int
    date: str
    destination: str
    travel_interests: List[str] = Field(default_factory=list)
    travel_pace: str = "balanced"
    vibe: str = "balanced"
    budget_per_day: float = 100.0
    currency: str = "USD"
    additional_instructions: Optional[str] = None
