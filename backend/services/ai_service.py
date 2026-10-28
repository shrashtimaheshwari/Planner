import os
import json
import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from pathlib import Path
from dotenv import load_dotenv
import httpx

from schemas import TripPreferences, ItineraryResponse, ItineraryDay, ActivityItem, RegenerateDayRequest

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()

# --- AI Provider Configuration ---
# Groq is active as the primary AI engine using free-tier models (llama-3.3-70b-versatile / llama-3.1-8b-instant)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

# Gemini is commented out as requested
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

def _calculate_days(start_date_str: str, end_date_str: str) -> int:
    try:
        d1 = datetime.strptime(start_date_str, "%Y-%m-%d")
        d2 = datetime.strptime(end_date_str, "%Y-%m-%d")
        delta = (d2 - d1).days + 1
        return max(1, min(delta, 14)) # Cap at 14 days for optimal generation
    except Exception:
        return 3

def _extract_json(text: str) -> Dict[str, Any]:
    """Cleanly extracts JSON object from markdown or text response"""
    text = text.strip()
    # Try finding markdown code block
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if match:
        text = match.group(1).strip()
    # Find outermost curly braces
    start_idx = text.find('{')
    end_idx = text.rfind('}')
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        text = text[start_idx:end_idx+1]
    return json.loads(text)

def _build_prompt(prefs: TripPreferences, total_days: int) -> str:
    interests_str = ", ".join(prefs.travel_interests) if prefs.travel_interests else "sightseeing, local culture, cuisine"
    return f"""You are a master travel curator and local destination expert.
Create a detailed, high-quality, realistic day-by-day travel itinerary for a trip to {prefs.destination}.

Trip Parameters:
- Destination: {prefs.destination}
- Starting From: {prefs.starting_location or 'Direct arrival'}
- Start Date: {prefs.start_date}
- End Date: {prefs.end_date}
- Total Duration: {total_days} days
- Total Budget: {prefs.budget} {prefs.currency}
- Travelers: {prefs.travelers_count} ({prefs.traveler_type})
- Interests: {interests_str}
- Travel Pace: {prefs.travel_pace} (relaxed = fewer stops and ample leisure; packed = full scheduled day; balanced = 3-4 key experiences)
- Vibe / Travel Style: {prefs.vibe or 'balanced'}
- Accommodation Preference: {prefs.accommodation_preference}
- Dietary Preferences: {prefs.dietary_preferences or 'None'}
- Special Notes: {prefs.additional_instructions or 'None'}

Key Scheduling & Practical Rules:
1. Divide the trip strictly into {total_days} consecutive days (Day 1 to Day {total_days}).
2. Group nearby attractions in the same half of the day to eliminate backtracking and long commutes.
3. For each day, organize activities chronologically across 'morning', 'afternoon', and 'evening'.
4. Provide estimated timings (e.g. "09:30 AM - 11:30 AM"), realistic duration, and estimated cost in {prefs.currency}.
5. State all prices, opening times, and travel times as estimates.
6. Provide specific local dining recommendations (restaurants/cafes) and sensible transit guidance (walk, metro, tram, taxi).
7. Keep daily estimated costs aligned with the total budget of {prefs.budget} {prefs.currency}.

You MUST return ONLY a valid, parseable JSON object matching this exact schema:
{{
  "title": "A captivating trip title e.g. 'Enchanting Paris: Art, Cafes & Historic Charm'",
  "destination": "{prefs.destination}",
  "start_date": "{prefs.start_date}",
  "end_date": "{prefs.end_date}",
  "total_days": {total_days},
  "budget": {prefs.budget},
  "currency": "{prefs.currency}",
  "estimated_total_cost": 0.0,
  "vibe": "{prefs.vibe or 'balanced'}",
  "traveler_type": "{prefs.traveler_type}",
  "travelers_count": {prefs.travelers_count},
  "days": [
    {{
      "day_number": 1,
      "date": "{prefs.start_date}",
      "theme": "Arrival & Historic Center Orientation",
      "accommodation_suggestion": "Recommended hotel or neighborhood area",
      "estimated_daily_cost": 120.0,
      "activities": [
        {{
          "id": "act-1-1",
          "period": "morning",
          "time": "09:30 AM - 11:30 AM",
          "title": "Iconic Landmark / First Attraction",
          "description": "Engaging 1-2 sentence description of what to experience.",
          "category": "sightseeing",
          "estimated_duration": "2 hours",
          "estimated_cost": 25.0,
          "transport_tip": "Short 10-minute walk or Metro Line 1",
          "dining_recommendation": "Cafe Name for fresh breakfast/pastries",
          "notes": "Book online to skip queues"
        }}
      ]
    }}
  ],
  "planning_tips": [
    "Practical local travel tip 1 (transport passes, customs, or safety)",
    "Practical tip 2 regarding currency, tipping, or timing"
  ],
  "budget_breakdown": {{
    "activities": 40.0,
    "dining": 35.0,
    "transport": 15.0,
    "misc": 10.0
  }}
}}
Return ONLY the raw JSON. No conversational preamble, no markdown comments outside the JSON.
"""

def _call_groq_api(prompt: str) -> Optional[Dict[str, Any]]:
    """Calls Groq API using free tier models: llama-3.3-70b-versatile, fallback to llama-3.1-8b-instant"""
    if not GROQ_API_KEY:
        return None

    models_to_try = [
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant"
    ]
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    for model_name in models_to_try:
        try:
            payload = {
                "model": model_name,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a professional travel itinerary planner that responds ONLY in valid JSON matching the user schema."
                    },
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.4
            }
            with httpx.Client(timeout=40.0) as client:
                res = client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    resp_json = res.json()
                    content = resp_json["choices"][0]["message"]["content"]
                    data = _extract_json(content)
                    print(f"[AI Service] Successfully generated itinerary using Groq ({model_name}).")
                    return data
                else:
                    print(f"[AI Service] Groq error ({model_name}): status {res.status_code} - {res.text}")
        except Exception as e:
            print(f"[AI Service] Groq request failed on {model_name}: {e}")

    return None

def _generate_fallback_itinerary(prefs: TripPreferences, total_days: int) -> ItineraryResponse:
    """Intelligent programmatic itinerary generator with destination-aware activities"""
    start_dt = datetime.strptime(prefs.start_date, "%Y-%m-%d")
    daily_budget = round(prefs.budget / max(1, total_days), 2)
    
    vibe = (prefs.vibe or "balanced").lower()
    pace = prefs.travel_pace.lower()
    dest = prefs.destination.strip().title()
    
    themes = [
        f"Arrival & {dest} City Center Orientation",
        f"Cultural Deep-Dive & Historic Heritage",
        f"Scenic Viewpoints & Architectural Marvels",
        f"Local Culinary Markets & Neighborhood Exploration",
        f"Nature Escapes & Hidden Gem Discovery",
        f"Art, Craftsmanship & Leisurely Strolls",
        f"Grand Panorama & Farewell Celebrations"
    ]
    
    days_list: List[ItineraryDay] = []
    total_estimated = 0.0
    
    for day_i in range(1, total_days + 1):
        current_date = (start_dt + timedelta(days=day_i - 1)).strftime("%Y-%m-%d")
        theme = themes[(day_i - 1) % len(themes)]
        
        # Morning activity
        morning_act = ActivityItem(
            id=f"act-{day_i}-1",
            period="morning",
            time="09:00 AM - 11:30 AM",
            title=f"{dest} Iconic Landmark & Walking Tour" if day_i == 1 else f"{dest} Old Quarter & Architecture Walk",
            description=f"Explore the vibrant heart of {dest}, taking in historical facades and captivating photo spots.",
            category="sightseeing",
            estimated_duration="2.5 hours",
            estimated_cost=round(daily_budget * 0.15, 1),
            transport_tip="10-15 minute walk from central accommodations or direct transit line",
            dining_recommendation=f"Local Artisan Bakery & Espresso Bar in {dest}",
            notes="Morning visits offer softer lighting and fewer crowds."
        )
        
        # Afternoon activity
        afternoon_act = ActivityItem(
            id=f"act-{day_i}-2",
            period="afternoon",
            time="01:30 PM - 04:00 PM",
            title=f"Signature Cultural Museum & Artisan District",
            description=f"Immerse yourself in authentic exhibits showcasing regional heritage, art, and local craftsmanship.",
            category="culture" if "culture" in prefs.travel_interests else "sightseeing",
            estimated_duration="2.5 hours",
            estimated_cost=round(daily_budget * 0.20, 1),
            transport_tip="Short 8-minute tram or metro ride from previous activity",
            dining_recommendation=f"Traditional Bistro featuring {prefs.dietary_preferences or 'local seasonal'} specialties",
            notes="Audio guides or student/senior discount passes may be available."
        )
        
        acts = [morning_act, afternoon_act]
        
        # Evening activity if balanced or packed
        if pace != "relaxed" or day_i in [1, total_days]:
            evening_act = ActivityItem(
                id=f"act-{day_i}-3",
                period="evening",
                time="06:30 PM - 09:30 PM",
                title=f"Sunset Waterfront Stroll & Gastronomic Dinner",
                description=f"Watch the sunset over {dest} followed by an intimate dining experience with ambient music and local wines/beverages.",
                category="food" if "food" in prefs.travel_interests else "relaxation",
                estimated_duration="3 hours",
                estimated_cost=round(daily_budget * 0.35, 1),
                transport_tip="Convenient rideshare or pleasant promenade walkway",
                dining_recommendation=f"Top-rated Dining Terrace overlooking {dest}'s illuminated skyline",
                notes="Reservations recommended for dinner during peak travel hours."
            )
            acts.append(evening_act)
            
        day_cost = sum(a.estimated_cost for a in acts) + round(daily_budget * 0.15, 1)
        total_estimated += day_cost
        
        days_list.append(ItineraryDay(
            day_number=day_i,
            date=current_date,
            theme=theme,
            activities=acts,
            estimated_daily_cost=round(day_cost, 2),
            accommodation_suggestion=f"Boutique Stay in {dest} Central District ({prefs.accommodation_preference or 'Convenient location'})"
        ))
        
    return ItineraryResponse(
        title=f"{vibe.capitalize()} Journey: The Best of {dest}",
        destination=dest,
        start_date=prefs.start_date,
        end_date=prefs.end_date,
        total_days=total_days,
        budget=prefs.budget,
        currency=prefs.currency,
        estimated_total_cost=round(total_estimated, 2),
        vibe=vibe,
        traveler_type=prefs.traveler_type,
        travelers_count=prefs.travelers_count,
        days=days_list,
        planning_tips=[
            f"Pre-purchase city transport passes at {dest} arrival hub to save up to 30% on intra-city rides.",
            f"Keep cash or small denominations handy for street food and independent market stalls in {dest}.",
            "All pricing and travel durations are estimates; check on-site ticketing for seasonal specials.",
            "Wear comfortable walking shoes as historic districts often feature cobblestone walkways."
        ],
        budget_breakdown={
            "activities": round(total_estimated * 0.40, 2),
            "dining": round(total_estimated * 0.40, 2),
            "transport": round(total_estimated * 0.15, 2),
            "misc": round(total_estimated * 0.05, 2)
        }
    )

def generate_itinerary(prefs: TripPreferences) -> ItineraryResponse:
    total_days = _calculate_days(prefs.start_date, prefs.end_date)
    prompt = _build_prompt(prefs, total_days)
    
    # 1. Groq Integration (Llama-3.3-70b-versatile / Llama-3.1-8b-instant)
    if GROQ_API_KEY:
        groq_data = _call_groq_api(prompt)
        if groq_data:
            try:
                return ItineraryResponse(**groq_data)
            except Exception as e:
                print(f"[AI Service] Groq response validation error: {e}")

    # --- GEMINI INTEGRATION (COMMENTED OUT AS REQUESTED) ---
    # if GEMINI_API_KEY:
    #     try:
    #         import google.generativeai as genai
    #         genai.configure(api_key=GEMINI_API_KEY)
    #         model = genai.GenerativeModel(
    #             model_name="gemini-1.5-flash",
    #             generation_config={"response_mime_type": "application/json"}
    #         )
    #         response = model.generate_content(prompt)
    #         data = _extract_json(response.text)
    #         return ItineraryResponse(**data)
    #     except Exception as e:
    #         print(f"[AI Service] Gemini call failed: {e}")

    # 2. OpenAI Alternative (if configured)
    if OPENAI_API_KEY:
        try:
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a professional travel itinerary planner that responds ONLY in structured JSON."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"}
            }
            with httpx.Client(timeout=30.0) as client:
                res = client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    resp_json = res.json()
                    content = resp_json["choices"][0]["message"]["content"]
                    data = _extract_json(content)
                    return ItineraryResponse(**data)
        except Exception as e:
            print(f"[AI Service] OpenAI call error: {e}")

    # 3. Resilient fallback generator tailored to user's destination & inputs
    print("[AI Service] Using intelligent programmatic generator (no external API key provided or network timeout).")
    return _generate_fallback_itinerary(prefs, total_days)

def regenerate_single_day(req: RegenerateDayRequest) -> ItineraryDay:
    """Regenerates activities specifically for a single day using Groq or fallback"""
    prompt = f"""Regenerate a fresh, exciting alternative schedule for Day {req.day_number} ({req.date}) in {req.destination}.
Interests: {', '.join(req.travel_interests) if req.travel_interests else 'general sightseeing'}
Pace: {req.travel_pace}
Vibe: {req.vibe}
Target daily budget: {req.budget_per_day} {req.currency}
Special Notes: {req.additional_instructions or 'None'}

Return ONLY valid JSON matching this schema:
{{
  "day_number": {req.day_number},
  "date": "{req.date}",
  "theme": "Alternative Day Theme",
  "accommodation_suggestion": "Suggested area or hotel",
  "estimated_daily_cost": {req.budget_per_day},
  "activities": [
    {{
      "id": "act-regen-1",
      "period": "morning",
      "time": "09:30 AM - 12:00 PM",
      "title": "Fresh Alternative Attraction",
      "description": "Engaging description",
      "category": "sightseeing",
      "estimated_duration": "2.5 hours",
      "estimated_cost": 20.0,
      "transport_tip": "Transit recommendation",
      "dining_recommendation": "Cafe or eatery recommendation",
      "notes": "Tip"
    }}
  ]
}}"""

    # 1. Try Groq
    if GROQ_API_KEY:
        groq_data = _call_groq_api(prompt)
        if groq_data:
            try:
                return ItineraryDay(**groq_data)
            except Exception as e:
                print(f"[AI Service] Groq regenerate day validation error: {e}")

    # --- GEMINI INTEGRATION (COMMENTED OUT AS REQUESTED) ---
    # if GEMINI_API_KEY:
    #     try:
    #         import google.generativeai as genai
    #         genai.configure(api_key=GEMINI_API_KEY)
    #         model = genai.GenerativeModel(
    #             model_name="gemini-1.5-flash",
    #             generation_config={"response_mime_type": "application/json"}
    #         )
    #         response = model.generate_content(prompt)
    #         data = _extract_json(response.text)
    #         return ItineraryDay(**data)
    #     except Exception as e:
    #         print(f"[AI Service] Regenerate day error with Gemini: {e}")

    # Fallback single day regeneration
    dest = req.destination.strip().title()
    acts = [
        ActivityItem(
            id=f"act-regen-{req.day_number}-1",
            period="morning",
            time="09:00 AM - 11:30 AM",
            title=f"{dest} Botanical Gardens & Panoramic Pavilion",
            description=f"Spend a serene morning discovering tranquil gardens, exotic flora, and panoramic view of {dest}.",
            category="nature",
            estimated_duration="2.5 hours",
            estimated_cost=round(req.budget_per_day * 0.2, 1),
            transport_tip="15-minute public transit ride from city center",
            dining_recommendation=f"Garden Pavilion Tea House in {dest}",
            notes="Early morning entry avoids mid-day heat."
        ),
        ActivityItem(
            id=f"act-regen-{req.day_number}-2",
            period="afternoon",
            time="01:30 PM - 04:30 PM",
            title=f"Artisan Workshops & Vintage Alleyways",
            description=f"Explore distinctive craft shops, independent galleries, and historic architecture in {dest}.",
            category="culture",
            estimated_duration="3 hours",
            estimated_cost=round(req.budget_per_day * 0.3, 1),
            transport_tip="Scenic walk along the old canal/promenade",
            dining_recommendation="Cozy neighborhood deli with regional sandwiches & fresh drinks",
            notes="Ideal for picking up authentic local souvenirs."
        ),
        ActivityItem(
            id=f"act-regen-{req.day_number}-3",
            period="evening",
            time="06:30 PM - 09:30 PM",
            title=f"Live Music Venue & Rooftop Tapas",
            description=f"Unwind with acoustic or jazz performances while savoring handcrafted tapas and local refreshments.",
            category="nightlife" if "nightlife" in req.travel_interests else "food",
            estimated_duration="3 hours",
            estimated_cost=round(req.budget_per_day * 0.35, 1),
            transport_tip="Short taxi or rideshare back to lodging",
            dining_recommendation="Rooftop Lounge overlooking historic district",
            notes="Check event calendar for entry tickets."
        )
    ]
    return ItineraryDay(
        day_number=req.day_number,
        date=req.date,
        theme=f"Hidden Treasures & Leisure in {dest}",
        activities=acts,
        estimated_daily_cost=req.budget_per_day,
        accommodation_suggestion=f"Convenient central stay in {dest}"
    )
