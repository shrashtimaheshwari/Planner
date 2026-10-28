import React, { useState } from 'react';
import { 
  Calendar, MapPin, Download, Bookmark, RefreshCw, 
  ArrowLeft, Clock, Bus, Utensils, Hotel, Sparkles, Check, 
  AlertCircle, IndianRupee, Sun, Sunset, Moon, Coffee, Heart,
  Users, Gauge, Compass
} from 'lucide-react';

export default function ItineraryView({ 
  itinerary, 
  currentPreferences,
  onBack, 
  onSave, 
  onDownloadPdf, 
  onRegenerateAll, 
  onRegenerateDay,
  isSaving,
  isDownloadingPdf,
  isSaved,
  isRegeneratingAll
}) {
  const [activeDayNumber, setActiveDayNumber] = useState(1);
  const [regeneratingDayNumber, setRegeneratingDayNumber] = useState(null);

  if (!itinerary) return null;

  const handleRegenDay = async (day) => {
    setRegeneratingDayNumber(day.day_number);
    try {
      await onRegenerateDay(day);
    } finally {
      setRegeneratingDayNumber(null);
    }
  };

  const currencySymbol = itinerary.currency === 'INR' ? '₹' : (itinerary.currency === 'USD' ? '$' : itinerary.currency);

  const budgetUsedPct = itinerary.budget > 0 
    ? Math.min(100, Math.round((itinerary.estimated_total_cost / itinerary.budget) * 100))
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-purple-100 shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-purple-700 px-3.5 py-2 rounded-2xl hover:bg-purple-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-purple-600" />
          <span>Edit Preferences</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Regenerate All Button */}
          <button
            onClick={onRegenerateAll}
            disabled={isRegeneratingAll}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 active:scale-98 border border-purple-200 px-4 py-2 rounded-2xl transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
            title="Generate a completely new plan with the same parameters"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isRegeneratingAll ? 'animate-spin' : ''}`} />
            <span>{isRegeneratingAll ? 'Regenerating Trip...' : 'Regenerate Trip'}</span>
          </button>

          {/* Save Trip Button */}
          <button
            onClick={onSave}
            disabled={isSaving || isSaved}
            className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl transition-all shadow-xs ${
              isSaved 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'bg-white hover:bg-purple-50 text-slate-800 border border-purple-200'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Saved to Supabase</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-purple-600" />
                <span>{isSaving ? 'Saving...' : 'Save Trip'}</span>
              </>
            )}
          </button>

          {/* Export PDF Button */}
          <button
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 px-5 py-2 rounded-2xl shadow-md shadow-purple-500/25 transition-all disabled:opacity-60"
          >
            {isDownloadingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Trip Regeneration Indicator Banner */}
      {isRegeneratingAll && (
        <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 text-white py-3.5 px-6 rounded-2xl flex items-center justify-between shadow-lg shadow-purple-600/20 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-white animate-spin" />
            </div>
            <div>
              <p className="font-bold text-sm">Groq AI is regenerating your entire itinerary...</p>
              <p className="text-xs text-pink-100">Designing brand-new day themes, activities, and dining trails for {itinerary.destination}</p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
            In Progress
          </span>
        </div>
      )}

      {/* Main 2-Column Grid (matching Pages 8 & 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Trip Summary Sidebar (matching Pages 8 & 9) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-purple-600 block mb-1">
                Selected Trip
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-500 shrink-0" />
                <span>{itinerary.destination}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                <span>{itinerary.start_date} → {itinerary.end_date} ({itinerary.total_days} Days)</span>
              </p>
            </div>

            {/* Quick Badges Grid */}
            <div className="space-y-3 pt-3 border-t border-purple-50 text-xs">
              
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Group Size</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>{itinerary.travelers_count} {itinerary.traveler_type || 'Travelers'}</span>
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider block mb-1">
                  Selected Styles & Pace
                </span>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {(itinerary.vibe || 'Cultural').split(',').map((v, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-100/80 capitalize">
                      {v.trim()}
                    </span>
                  ))}
                  <span className="px-2.5 py-0.5 rounded-lg bg-pink-50 text-pink-700 font-semibold text-xs border border-pink-100/80 capitalize">
                    {currentPreferences?.travel_pace || 'Balanced'} Pace
                  </span>
                </div>
              </div>

              {/* Core Interests Tags */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  Core Interests
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(currentPreferences?.travel_interests || ['culture', 'sightseeing', 'food']).map(interest => (
                    <span
                      key={interest}
                      className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-100 capitalize"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Total Budget Card (matching Page 9) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white space-y-3 shadow-md">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 block">
                Total Estimated Budget
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {currencySymbol} {itinerary.estimated_total_cost.toLocaleString()}
                </span>
                <span className="text-xs text-purple-200">
                  Target: {currencySymbol} {itinerary.budget.toLocaleString()}
                </span>
              </div>

              {/* Budget Health Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${budgetUsedPct > 95 ? 'bg-amber-400' : 'bg-gradient-to-r from-purple-400 to-pink-400'}`}
                    style={{ width: `${budgetUsedPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-purple-300 font-semibold">
                  <span>{budgetUsedPct}% of budget planned</span>
                  <span>{itinerary.currency}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Day Switcher Pills */}
          <div className="bg-white rounded-3xl border border-purple-100 p-4 shadow-sm space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-2">
              Jump to Day
            </span>
            <div className="flex flex-wrap gap-1.5">
              {itinerary.days.map(d => (
                <button
                  key={d.day_number}
                  onClick={() => {
                    setActiveDayNumber(d.day_number);
                    const el = document.getElementById(`day-card-${d.day_number}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeDayNumber === d.day_number
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-xs'
                      : 'bg-purple-50/60 hover:bg-purple-100 text-slate-700'
                  }`}
                >
                  Day {d.day_number}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Day-Wise Cards (matching Pages 8 & 9) */}
        <div className="lg:col-span-8 space-y-8">
          
          {itinerary.days.map((day) => {
            const morningAct = day.activities.find(a => a.period.toLowerCase() === 'morning') || day.activities[0];
            const afternoonAct = day.activities.find(a => a.period.toLowerCase() === 'afternoon') || day.activities[1];
            const eveningAct = day.activities.find(a => a.period.toLowerCase() === 'evening') || day.activities[2];
            
            // Extract dining recommendation if present or fallback to activity note
            const diningInfo = day.activities.find(a => a.dining_recommendation)?.dining_recommendation || 
              `Local food specialties & regional cafes in ${itinerary.destination}`;

            // Extract transit tip
            const transitInfo = day.activities.find(a => a.transport_tip)?.transport_tip || 
              `Auto-rickshaws, metro lines, or local cabs available throughout ${itinerary.destination}`;

            return (
              <div 
                key={day.day_number}
                id={`day-card-${day.day_number}`}
                className="relative bg-white rounded-3xl border border-purple-100/90 shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 space-y-6 overflow-hidden"
              >
                {/* Day Regeneration Overlay */}
                {regeneratingDayNumber === day.day_number && (
                  <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3.5 p-6 animate-in fade-in duration-200">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/30">
                      <RefreshCw className="w-6 h-6 animate-spin text-pink-100" />
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="font-serif font-bold text-stone-900 text-lg sm:text-xl tracking-tight">
                        Regenerating Day {day.day_number}...
                      </h4>
                      <p className="text-xs sm:text-sm text-purple-800 font-medium max-w-sm">
                        Groq AI is handcrafting fresh attractions, local food trails, and scenic routes for this day.
                      </p>
                    </div>
                    <div className="w-48 h-1.5 bg-purple-100 rounded-full overflow-hidden mt-1">
                      <div className="w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 animate-pulse rounded-full" />
                    </div>
                  </div>
                )}
                
                {/* Day Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-purple-100">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white font-serif font-black text-xl flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                      {String(day.day_number).padStart(2, '0')}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                          Day {day.day_number}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs font-semibold text-purple-700">{day.date}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        {day.theme || `Discover ${itinerary.destination}`}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                        Daily Budget
                      </span>
                      <span className="text-lg sm:text-xl font-serif font-bold bg-gradient-to-r from-purple-800 to-pink-700 bg-clip-text text-transparent">
                        {currencySymbol} {day.estimated_daily_cost.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRegenDay(day)}
                      disabled={regeneratingDayNumber === day.day_number || isRegeneratingAll}
                      className={`p-2.5 sm:px-3 sm:py-2 rounded-2xl transition-all border cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                        regeneratingDayNumber === day.day_number 
                          ? 'bg-purple-100 text-purple-900 border-purple-300' 
                          : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                      }`}
                      title="Regenerate this specific day"
                    >
                      <RefreshCw className={`w-4 h-4 ${regeneratingDayNumber === day.day_number ? 'animate-spin text-purple-600' : ''}`} />
                      <span className="text-xs font-bold hidden sm:inline">
                        {regeneratingDayNumber === day.day_number ? 'Regenerating...' : 'Regen Day'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 4 Spacious, Readable Quadrants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Quadrant 1: Morning Exploration */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-amber-200/90 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 text-xs bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                          <Sun className="w-3.5 h-3.5 text-amber-600" /> Morning Exploration
                        </span>
                        {morningAct && (
                          <span className="font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full text-xs">
                            {currencySymbol} {morningAct.estimated_cost}
                          </span>
                        )}
                      </div>
                      {morningAct ? (
                        <>
                          <h4 className="font-serif font-bold text-stone-900 text-base sm:text-lg leading-snug">
                            {morningAct.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                            {morningAct.description}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-stone-500">Leisurely morning exploration & breakfast.</p>
                      )}
                    </div>
                    {morningAct && (
                      <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-amber-100/70 text-xs">
                        <span className="font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg">
                          ⏰ {morningAct.time}
                        </span>
                        <span className="font-semibold text-stone-600 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/60">
                          ⏱️ {morningAct.estimated_duration}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quadrant 2: Afternoon Journey */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-purple-200/90 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold uppercase tracking-wider text-purple-800 flex items-center gap-1.5 text-xs bg-purple-50 px-3 py-1 rounded-full border border-purple-200/60">
                          <Compass className="w-3.5 h-3.5 text-purple-600" /> Afternoon Journey
                        </span>
                        {afternoonAct && (
                          <span className="font-bold text-purple-900 bg-purple-100/80 px-2.5 py-0.5 rounded-full text-xs">
                            {currencySymbol} {afternoonAct.estimated_cost}
                          </span>
                        )}
                      </div>
                      {afternoonAct ? (
                        <>
                          <h4 className="font-serif font-bold text-stone-900 text-base sm:text-lg leading-snug">
                            {afternoonAct.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                            {afternoonAct.description}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-stone-500">Afternoon cultural highlights & sightseeing.</p>
                      )}
                    </div>
                    {afternoonAct && (
                      <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-purple-100/70 text-xs">
                        <span className="font-semibold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg">
                          ⏰ {afternoonAct.time}
                        </span>
                        <span className="font-semibold text-stone-600 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/60">
                          ⏱️ {afternoonAct.estimated_duration}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quadrant 3: Evening Charm */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-indigo-200/90 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5 text-xs bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
                          <Moon className="w-3.5 h-3.5 text-indigo-600" /> Evening Charm
                        </span>
                        {eveningAct && (
                          <span className="font-bold text-indigo-900 bg-indigo-100/80 px-2.5 py-0.5 rounded-full text-xs">
                            {currencySymbol} {eveningAct.estimated_cost}
                          </span>
                        )}
                      </div>
                      {eveningAct ? (
                        <>
                          <h4 className="font-serif font-bold text-stone-900 text-base sm:text-lg leading-snug">
                            {eveningAct.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                            {eveningAct.description}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-stone-500">Sunset viewpoints and evening leisure.</p>
                      )}
                    </div>
                    {eveningAct && (
                      <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-indigo-100/70 text-xs">
                        <span className="font-semibold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg">
                          ⏰ {eveningAct.time}
                        </span>
                        <span className="font-semibold text-stone-600 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/60">
                          ⏱️ {eveningAct.estimated_duration}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quadrant 4: Cuisine & Dining */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-pink-200/90 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold uppercase tracking-wider text-pink-800 flex items-center gap-1.5 text-xs bg-pink-50 px-3 py-1 rounded-full border border-pink-200/60">
                          <Utensils className="w-3.5 h-3.5 text-pink-600" /> Cuisine & Dining
                        </span>
                        <span className="font-bold text-pink-900 bg-pink-100/80 px-2.5 py-0.5 rounded-full text-xs">
                          Local Flavors
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-stone-900 text-base sm:text-lg leading-snug">
                        Signature Culinary Experiences
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                        {diningInfo}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-pink-100/70 text-xs">
                      <p className="text-pink-800 font-semibold flex items-center gap-1.5">
                        <span>🍴</span>
                        <span>Authentic thalis, iconic local snacks & cozy cafes</span>
                      </p>
                    </div>
                  </div>

                </div>

                {/* Bottom Bar: Stay & Transit Guidance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/80 flex items-start gap-3 text-stone-700">
                    <Hotel className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[10px] text-purple-700 block mb-0.5">Stay Recommendation</span>
                      <span className="text-xs leading-relaxed">{day.accommodation_suggestion || `Convenient heritage or boutique stay in ${itinerary.destination}`}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100/80 flex items-start gap-3 text-stone-700">
                    <Bus className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[10px] text-pink-700 block mb-0.5">Transit Guidance</span>
                      <span className="text-xs leading-relaxed">{transitInfo}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}

          {/* Planning Tips Box */}
          {itinerary.planning_tips && itinerary.planning_tips.length > 0 && (
            <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Local Planning Tips for {itinerary.destination}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {itinerary.planning_tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 rounded-2xl bg-purple-50/40 border border-purple-100 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
