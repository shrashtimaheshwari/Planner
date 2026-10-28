# WanderPlan AI - Personalized Travel Itinerary Planner 🌍✈️

An AI-powered, full-stack web application designed to generate customized, day-by-day travel itineraries based on destination, dates, budget, group size, travel style, and vibe.

---

## 🌟 Key Features

- **Intuitive Preference Collection**: Destination, start/end dates, total budget, currency selector, group size/type, pace (relaxed, balanced, packed), accommodation style, dietary restrictions, and special requests.
- **Vibe-Based Personalization**: 8 curated travel styles (*Romantic & Scenic, Cultural Exploration, Food-Focused, Adventurous, Budget-Friendly, Luxury & Comfort, Relaxed & Peaceful, Family-Friendly*).
- **AI Recommendation Engine**: Generates structured, chronological daily schedules (Morning, Afternoon, Evening) with attraction descriptions, suggested durations, estimated costs, transit advice, and local dining recommendations.
- **Interactive Daily Itinerary View**: Multi-day timeline, day navigation tabs, budget utilization progress bar, and local travel planning tips.
- **Single-Day Regeneration**: Refresh activities for an individual day without altering the rest of your trip.
- **Supabase Database Persistence**: Save trips, review previously saved itineraries, and reopen or delete trips at any time (with automatic resilient fallback).
- **PDF Itinerary Export**: Download a styled, print-ready travel itinerary document generated dynamically with ReportLab.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn |
| **AI Engine** | Google Gemini API (`gemini-1.5-flash`) / OpenAI API with fallback |
| **Database** | Supabase (PostgreSQL with RLS) + local resilient storage |
| **PDF Export** | ReportLab |

---

## 📁 Repository Structure

```
wanderplan-ai/
├── backend/
│   ├── main.py                  # FastAPI application & REST endpoints
│   ├── schemas.py               # Pydantic data models & validation schemas
│   ├── database.py              # Supabase client & persistent storage
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Backend environment variables template
│   └── services/
│       ├── ai_service.py        # LLM integration & prompt structuring
│       └── pdf_service.py       # ReportLab PDF generator
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Header & health status indicator
│   │   │   ├── TripForm.jsx         # Preference input form with presets
│   │   │   ├── ItineraryView.jsx    # Interactive schedule & timeline
│   │   │   ├── SavedTripsModal.jsx  # Saved trips browser & manager
│   │   │   └── Toast.jsx            # Feedback notification system
│   │   ├── services/
│   │   │   └── api.js               # Backend API client
│   │   ├── App.jsx                  # Main application state orchestrator
│   │   └── index.css                # Tailwind directives & design tokens
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── supabase/
│   └── schema.sql               # PostgreSQL schema & RLS policies
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+
- (Optional) **Supabase** account & project
- (Optional) **Google Gemini API Key** or **OpenAI API Key**

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
# Optional: Google Gemini API Key (generates real-time AI itineraries)
GEMINI_API_KEY=your_gemini_api_key

# Optional: Supabase PostgreSQL credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key

PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Start the FastAPI backend server:
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The API documentation is accessible at `http://127.0.0.1:8000/docs`.

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🗄️ Database Setup (Supabase)

To connect your Supabase database:
1. Log into [supabase.com](https://supabase.com) and create a new project.
2. In the Supabase dashboard, navigate to the **SQL Editor**.
3. Open `supabase/schema.sql` from this repository and run the SQL commands.
4. Copy your **Project URL** and **anon / service_role key** into `backend/.env`.

---

## 🌐 Deployment Instructions

### Backend (Render / Railway)
1. Link your GitHub repository.
2. Root directory: `backend`.
3. Build command: `pip install -r requirements.txt`.
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. Set environment variables (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, `CORS_ORIGINS`).

### Frontend (Vercel)
1. Link your GitHub repository.
2. Root directory: `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Environment variable: `VITE_API_URL=https://your-backend.onrender.com`.

---

## 🧪 Testing

- Health endpoint: `GET /api/health`
- Generate itinerary: `POST /api/itinerary/generate`
- Regenerate day: `POST /api/itinerary/regenerate-day`
- Trips CRUD: `GET /api/trips`, `POST /api/trips`, `DELETE /api/trips/{id}`
- PDF download: `POST /api/export/pdf`
