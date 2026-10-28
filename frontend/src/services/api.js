import { generateDemoItinerary } from './demoFallback';

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

// Persistent client/user identifier so each user only sees & manages their own trips
export function getClientId() {
  let clientId = localStorage.getItem('wanderplan_client_id');
  if (!clientId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      clientId = crypto.randomUUID();
    } else {
      clientId = 'usr_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    }
    localStorage.setItem('wanderplan_client_id', clientId);
  }
  return clientId;
}

function getHeaders(extraHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    'X-Client-Id': getClientId(),
    ...extraHeaders
  };
}

// Local storage helpers for demo mode
function getLocalTrips() {
  try {
    const raw = localStorage.getItem('wanderplan_saved_trips');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalTrip(trip) {
  const current = getLocalTrips().filter(t => t.id !== trip.id);
  const updated = [trip, ...current];
  localStorage.setItem('wanderplan_saved_trips', JSON.stringify(updated));
  return trip;
}

function deleteLocalTrip(id) {
  const current = getLocalTrips().filter(t => t.id !== id);
  localStorage.setItem('wanderplan_saved_trips', JSON.stringify(current));
  return true;
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'demo_mode', message: 'Running in Standalone Demo Mode' };
  }
}

export async function generateItinerary(preferences) {
  try {
    const res = await fetch(`${API_BASE}/api/itinerary/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(preferences),
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using client-side AI generator fallback:', err.message);
    // Graceful fallback to client generator so demo NEVER fails
    return generateDemoItinerary(preferences);
  }
}

export async function regenerateDay(req) {
  try {
    const res = await fetch(`${API_BASE}/api/itinerary/regenerate-day`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Regenerate day fallback:', err.message);
    const mockTrip = generateDemoItinerary({
      destination: req.destination,
      travel_pace: req.travel_pace,
      vibe: req.vibe,
      budget: req.daily_budget * 3,
      currency: 'INR'
    });
    const fallbackDay = mockTrip.days[0];
    fallbackDay.day_number = req.day_number;
    fallbackDay.date = req.date;
    fallbackDay.theme = `Alternative Explorer: ${req.destination} Hidden Corners`;
    return fallbackDay;
  }
}

export async function saveTrip(tripData) {
  const payload = {
    ...tripData,
    user_id: getClientId()
  };

  try {
    const res = await fetch(`${API_BASE}/api/trips`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) throw new Error(`Failed to save trip (${res.status})`);
    const data = await res.json();
    saveLocalTrip(data);
    return data;
  } catch (err) {
    console.warn('Saving trip to local storage fallback:', err.message);
    const fallbackSaved = {
      ...payload,
      id: payload.id || `trip_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    saveLocalTrip(fallbackSaved);
    return fallbackSaved;
  }
}

export async function getTrips() {
  try {
    const res = await fetch(`${API_BASE}/api/trips`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const remote = await res.json();
    return remote && remote.length > 0 ? remote : getLocalTrips();
  } catch (err) {
    console.warn('Loading trips from local storage fallback:', err.message);
    return getLocalTrips();
  }
}

export async function getTripById(id) {
  try {
    const res = await fetch(`${API_BASE}/api/trips/${id}`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    return await res.json();
  } catch (err) {
    const local = getLocalTrips().find(t => t.id === id);
    if (local) return local;
    throw new Error('Trip not found');
  }
}

export async function deleteTrip(id) {
  try {
    const res = await fetch(`${API_BASE}/api/trips/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      signal: AbortSignal.timeout(4000)
    });
    deleteLocalTrip(id);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    return await res.json();
  } catch (err) {
    deleteLocalTrip(id);
    return { success: true };
  }
}

export async function downloadPdf(itinerary) {
  try {
    const res = await fetch(`${API_BASE}/api/export/pdf`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(itinerary),
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`Failed to generate PDF: ${res.status}`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Itinerary_${itinerary.destination.replace(/[\s,]+/g, '_')}_${itinerary.start_date}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.warn('Backend PDF endpoint unreachable, invoking print dialog:', err.message);
    window.print();
  }
}

