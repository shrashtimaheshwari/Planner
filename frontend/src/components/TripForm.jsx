import React, { useState } from 'react';
import { 
  MapPin, Calendar, DollarSign, Users, Sparkles, Heart, Compass, 
  Utensils, Hotel, Clock, ArrowRight, Wand2, CheckCircle2, AlertCircle
} from 'lucide-react';

const POPULAR_DESTINATIONS = [
  'Tokyo, Japan', 'Paris, France', 'Rome, Italy', 'Bali, Indonesia', 
  'Kyoto, Japan', 'New York, USA', 'Reykjavik, Iceland', 'Barcelona, Spain'
];

const INTEREST_OPTIONS = [
  { id: 'sightseeing', label: 'Sightseeing', icon: '🏛️' },
  { id: 'culture', label: 'Culture & History', icon: '🎨' },
  { id: 'food', label: 'Food & Dining', icon: '🍜' },
  { id: 'nature', label: 'Nature & Parks', icon: '🌲' },
  { id: 'adventure', label: 'Adventure', icon: '🧗' },
  { id: 'relaxation', label: 'Relaxation', icon: '🏖️' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'nightlife', label: 'Nightlife', icon: '🍸' },
];

const VIBE_OPTIONS = [
  { id: 'romantic', label: 'Romantic & Scenic', desc: 'Intimate viewpoints, charming bistros & sunset strolls' },
  { id: 'cultural', label: 'Cultural Exploration', desc: 'Museums, historic quarters, ancient monuments & architecture' },
  { id: 'food-focused', label: 'Food-focused', desc: 'Street food markets, artisan bakeries & signature dining' },
  { id: 'adventurous', label: 'Adventurous', desc: 'Active exploration, hiking & dynamic excursions' },
  { id: 'budget-friendly', label: 'Budget-friendly', desc: 'Smart spending, free attractions & local transit' },
  { id: 'luxury', label: 'Luxury & Comfort', desc: 'Fine dining, private transport & upscale experiences' },
  { id: 'relaxed', label: 'Relaxed & Peaceful', desc: 'Slow mornings, garden cafes & leisurely pace' },
  { id: 'family-friendly', label: 'Family-friendly', desc: 'Welcoming spaces, interactive spots & easy logistics' },
];

export default function TripForm({ onGenerate, isLoading }) {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    destination: '',
    starting_location: '',
    start_date: today,
    end_date: nextWeek,
    budget: 1500,
    currency: 'USD',
    travelers_count: 2,
    traveler_type: 'couple',
    travel_interests: ['sightseeing', 'food', 'culture'],
    travel_pace: 'balanced',
    vibe: 'romantic',
    accommodation_preference: 'Mid-range Hotel',
    dietary_preferences: 'No restrictions',
    additional_instructions: ''
  });

  const [errors, setErrors] = useState({});

  const handleInterestToggle = (id) => {
    setFormData(prev => {
      const exists = prev.travel_interests.includes(id);
      const updated = exists 
        ? prev.travel_interests.filter(item => item !== id)
        : [...prev.travel_interests, id];
      return { ...prev, travel_interests: updated };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.destination.trim()) {
      newErrors.destination = 'Please enter a destination city or country';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'End date cannot be earlier than start date';
    }
    if (!formData.budget || formData.budget <= 0) {
      newErrors.budget = 'Please enter a valid positive budget';
    }
    if (formData.travelers_count < 1) {
      newErrors.travelers_count = 'At least 1 traveler required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onGenerate(formData);
    }
  };

  // Quick preset loader for fast testing
  const loadPreset = (dest, vibe, budget, currency) => {
    setFormData(prev => ({
      ...prev,
      destination: dest,
      vibe: vibe,
      budget: budget,
      currency: currency
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Travel Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Design Your Ideal Itinerary in Seconds
        </h1>
        <p className="mt-2 text-base text-slate-600 max-w-2xl mx-auto">
          Tailored to your budget, travel vibe, pace, and interests. Generates daily schedules, transit estimates, and dining recommendations.
        </p>

        {/* Quick Inspiration Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1">Quick picks:</span>
          {POPULAR_DESTINATIONS.slice(0, 5).map(city => (
            <button
              key={city}
              type="button"
              onClick={() => loadPreset(city, 'cultural', 1800, 'USD')}
              className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-full border border-slate-200 transition-colors shadow-xs"
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">

        {/* Section 1: Where & When */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-sky-600" />
            1. Where & When
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Destination */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Destination <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-destination"
                  type="text"
                  placeholder="e.g. Kyoto, Japan or Florence, Italy"
                  value={formData.destination}
                  onChange={e => setFormData({ ...formData, destination: e.target.value })}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${
                    errors.destination ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-300 focus:border-sky-500'
                  } focus:outline-none focus:ring-2 focus:ring-sky-100 text-sm`}
                />
              </div>
              {errors.destination && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.destination}
                </p>
              )}
            </div>

            {/* Starting Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Starting From <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="input-starting-location"
                type="text"
                placeholder="e.g. San Francisco or London"
                value={formData.starting_location}
                onChange={e => setFormData({ ...formData, starting_location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-sm"
              />
            </div>

            {/* Travel Pace */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Travel Pace
              </label>
              <select
                id="select-travel-pace"
                value={formData.travel_pace}
                onChange={e => setFormData({ ...formData, travel_pace: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-sm bg-white"
              >
                <option value="relaxed">Relaxed (1-2 main highlights, plenty of downtime)</option>
                <option value="balanced">Balanced (3-4 activities with leisure & meals)</option>
                <option value="packed">Packed (Full dynamic day exploring as much as possible)</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-start-date"
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-sm"
                />
              </div>
              {errors.start_date && <p className="mt-1 text-xs text-rose-500">{errors.start_date}</p>}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                End Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-end-date"
                  type="date"
                  value={formData.end_date}
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-sm"
                />
              </div>
              {errors.end_date && <p className="mt-1 text-xs text-rose-500">{errors.end_date}</p>}
            </div>

          </div>
        </div>

        {/* Section 2: Budget & Travelers */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-sky-600" />
            2. Budget & Travelers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Total Budget */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Budget <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-budget"
                  type="number"
                  min="50"
                  step="50"
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-sm font-medium"
                />
              </div>
              {errors.budget && <p className="mt-1 text-xs text-rose-500">{errors.budget}</p>}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Currency
              </label>
              <select
                id="select-currency"
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-sm bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            {/* Travelers Count & Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Travelers & Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="input-travelers-count"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.travelers_count}
                  onChange={e => setFormData({ ...formData, travelers_count: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-sm text-center font-medium"
                />
                <select
                  id="select-traveler-type"
                  value={formData.traveler_type}
                  onChange={e => setFormData({ ...formData, traveler_type: e.target.value })}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-xs bg-white"
                >
                  <option value="solo">Solo</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="group">Group</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Vibe Selection */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-sky-600" />
            3. Choose Trip Vibe
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {VIBE_OPTIONS.map(v => {
              const isSelected = formData.vibe === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, vibe: v.id })}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected 
                      ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-1 ring-sky-400' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                      {v.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{v.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Travel Interests */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Compass className="w-5 h-5 text-sky-600" />
            4. Travel Interests
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {INTEREST_OPTIONS.map(item => {
              const selected = formData.travel_interests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleInterestToggle(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    selected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Preferences & Special Notes */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-sky-600" />
            5. Accommodation & Dietary Notes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Accommodation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Accommodation Style
              </label>
              <select
                id="select-accommodation"
                value={formData.accommodation_preference}
                onChange={e => setFormData({ ...formData, accommodation_preference: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-sm bg-white"
              >
                <option value="Mid-range Hotel">Mid-range Hotel (Comfortable & Central)</option>
                <option value="Boutique Hotel">Boutique & Heritage Hotel</option>
                <option value="Budget Hostel">Budget Hostel / Guesthouse</option>
                <option value="Luxury Resort">Luxury 5-Star Resort</option>
                <option value="Apartment / Airbnb">Apartment / Airbnb Rental</option>
              </select>
            </div>

            {/* Dietary */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Dietary Preference
              </label>
              <select
                id="select-dietary"
                value={formData.dietary_preferences}
                onChange={e => setFormData({ ...formData, dietary_preferences: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-sm bg-white"
              >
                <option value="No restrictions">No restrictions (Local foodies)</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Halal">Halal</option>
                <option value="Kosher">Kosher</option>
                <option value="Gluten-free">Gluten-free</option>
              </select>
            </div>

            {/* Additional instructions */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Special Requests or Specific Must-See Sights <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="input-additional-instructions"
                rows={2}
                placeholder="e.g. Love coffee shops, avoid steep hikes, want 1 afternoon free for shopping..."
                value={formData.additional_instructions}
                onChange={e => setFormData({ ...formData, additional_instructions: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 text-sm"
              />
            </div>

          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            id="generate-itinerary-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 active:from-sky-700 active:to-cyan-700 shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed group text-base"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Personalized Itinerary...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Generate My Itinerary</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-400 mt-2.5">
            Schedules, distances, and costs are curated estimates generated to fit your personal travel parameters.
          </p>
        </div>

      </form>
    </div>
  );
}
