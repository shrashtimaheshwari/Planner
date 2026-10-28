import React, { useState } from 'react';
import { 
  MapPin, Calendar, Users, IndianRupee, Sparkles, Heart, Compass, 
  Utensils, Hotel, ArrowRight, ArrowLeft, Wand2, CheckCircle2, AlertCircle,
  Gem, Landmark, Camera, Mountain, Coffee, Sun, Wallet, DollarSign
} from 'lucide-react';

const INDIAN_QUICK_PICKS = [
  'Manali, Himachal Pradesh', 'Goa, India', 'Jaipur, Rajasthan', 
  'Varanasi, Uttar Pradesh', 'Leh Ladakh, India', 'Udaipur, Rajasthan',
  'Mumbai, Maharashtra', 'Hyderabad, Telangana'
];

const TRAVEL_STYLES = [
  { id: 'cultural', label: 'Cultural', icon: Landmark, desc: 'Heritage, temples & historic palaces' },
  { id: 'romantic', label: 'Romantic', icon: Heart, desc: 'Lakes, scenic sunsets & intimate cafes' },
  { id: 'adventurous', label: 'Adventure', icon: Mountain, desc: 'Himalayan treks, rafting & snow sports' },
  { id: 'food-focused', label: 'Food-focused', icon: Utensils, desc: 'Street food, regional thalis & authentic dining' },
  { id: 'relaxed', label: 'Relaxed', icon: Sun, desc: 'Peaceful stays, slow mornings & wellness' },
  { id: 'luxury', label: 'Luxury', icon: Gem, desc: 'Heritage havelis, 5-star comfort & private transit' },
  { id: 'budget-friendly', label: 'Budget-friendly', icon: Wallet, desc: 'Smart spending, free attractions & local transit' },
  { id: 'sightseeing', label: 'Sightseeing', icon: Camera, desc: 'Iconic landmarks & scenic photography' },
];

const INTERESTS = [
  { id: 'food', label: 'Food & Dining', emoji: '🍛' },
  { id: 'culture', label: 'History & Culture', emoji: '🏛️' },
  { id: 'nature', label: 'Nature & Scenic', emoji: '🌲' },
  { id: 'adventure', label: 'Adventure', emoji: '🧗' },
  { id: 'art', label: 'Art & Architecture', emoji: '🎨' },
  { id: 'shopping', label: 'Bazaars & Shopping', emoji: '🛍️' },
  { id: 'nightlife', label: 'Nightlife & Cafes', emoji: '✨' },
  { id: 'relaxation', label: 'Relaxation', emoji: '🧘' },
];

export default function TripWizard({ initialDestination, onGenerate, isLoading, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [step, setStep] = useState(1);

  const initialDestName = typeof initialDestination === 'string'
    ? initialDestination
    : (initialDestination?.name || 'Jaipur, Rajasthan');

  const [formData, setFormData] = useState({
    destination: initialDestName,
    starting_location: '',
    start_date: today,
    end_date: nextWeek,
    budget: 15000,
    currency: 'INR',
    travelers_count: 2,
    traveler_type: 'couple',
    travel_interests: initialDestination?.suggestedInterests || ['culture', 'food', 'nature'],
    travel_pace: initialDestination?.suggestedPace || 'balanced',
    vibe: initialDestination?.suggestedVibe || 'cultural',
    vibes: [initialDestination?.suggestedVibe || 'cultural'],
    accommodation_preference: 'Mid-range Hotel',
    dietary_preferences: 'Vegetarian',
    additional_instructions: ''
  });

  const [errors, setErrors] = useState({});

  // Sync if destination prop changes
  React.useEffect(() => {
    if (initialDestination) {
      const name = typeof initialDestination === 'string' ? initialDestination : initialDestination.name;
      if (name) {
        const destVibe = initialDestination.suggestedVibe || 'cultural';
        setFormData(prev => ({
          ...prev,
          destination: name,
          travel_interests: initialDestination.suggestedInterests || prev.travel_interests,
          travel_pace: initialDestination.suggestedPace || prev.travel_pace,
          vibe: destVibe,
          vibes: [destVibe],
        }));
      }
    }
  }, [initialDestination]);

  const validateStep1 = () => {
    const errs = {};
    const dest = (formData.destination || '').trim();
    if (!dest) {
      errs.destination = 'Please enter or select a destination';
    }
    if (!formData.start_date) errs.start_date = 'Start date is required';
    if (!formData.end_date) errs.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      errs.end_date = 'End date cannot be earlier than start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    return true;
  };

  const validateStep3 = () => {
    const errs = {};
    if (!formData.budget || formData.budget <= 0) {
      errs.budget = 'Please enter a valid budget';
    }
    if (formData.travelers_count < 1) {
      errs.travelers_count = 'At least 1 traveler required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setErrors({});
        setStep(2);
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setErrors({});
        setStep(3);
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    setErrors({});
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep3()) {
      const selectedVibes = formData.vibes && formData.vibes.length > 0
        ? formData.vibes
        : [formData.vibe || 'cultural'];
      
      const payload = {
        ...formData,
        vibe: selectedVibes.join(', ')
      };
      onGenerate(payload);
    }
  };

  const toggleVibe = (id) => {
    setFormData(prev => {
      const current = Array.isArray(prev.vibes) ? prev.vibes : (prev.vibe ? [prev.vibe] : ['cultural']);
      const exists = current.includes(id);
      let updated;
      if (exists) {
        // Keep at least 1 vibe selected
        updated = current.length > 1 ? current.filter(x => x !== id) : current;
      } else {
        updated = [...current, id];
      }
      return {
        ...prev,
        vibes: updated,
        vibe: updated.join(', ')
      };
    });
  };

  const toggleInterest = (id) => {
    setFormData(prev => {
      const exists = prev.travel_interests.includes(id);
      return {
        ...prev,
        travel_interests: exists 
          ? prev.travel_interests.filter(item => item !== id)
          : [...prev.travel_interests, id]
      };
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      
      {/* 3-Step Progress Indicator (matching Pages 10 & 11) */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative max-w-lg mx-auto">
          
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-purple-100 -translate-y-1/2 -z-0" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 -translate-y-1/2 -z-0 transition-all duration-300"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />

          {/* Step 1 Badge */}
          <button 
            type="button"
            onClick={() => setStep(1)}
            className="flex flex-col items-center gap-1.5 relative z-10 group cursor-pointer focus:outline-none"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= 1 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30' 
                : 'bg-white text-stone-400 border-2 border-purple-100'
            }`}>
              1
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= 1 ? 'text-purple-700' : 'text-stone-400'}`}>
              Basics
            </span>
          </button>

          {/* Step 2 Badge */}
          <button 
            type="button"
            onClick={() => { if (validateStep1()) { setErrors({}); setStep(2); } }}
            className="flex flex-col items-center gap-1.5 relative z-10 group cursor-pointer focus:outline-none"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= 2 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30' 
                : 'bg-white text-stone-400 border-2 border-purple-100'
            }`}>
              2
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= 2 ? 'text-purple-700' : 'text-stone-400'}`}>
              Preferences
            </span>
          </button>

          {/* Step 3 Badge */}
          <button 
            type="button"
            onClick={() => { if (validateStep1()) { setErrors({}); setStep(3); } }}
            className="flex flex-col items-center gap-1.5 relative z-10 group cursor-pointer focus:outline-none"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step === 3 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30' 
                : 'bg-white text-stone-400 border-2 border-purple-100'
            }`}>
              3
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${step === 3 ? 'text-purple-700' : 'text-stone-400'}`}>
              Logistics
            </span>
          </button>

        </div>
      </div>

      {/* Main Wizard Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-900/5 p-6 sm:p-10 space-y-6">

        {/* STEP 1: Essential Details (matching Page 11) */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Essential Details</h2>
              <p className="text-sm text-slate-500">Tell us where and when you want to go.</p>
            </div>

            {/* Destination Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Destination <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  placeholder="e.g. Jaipur, Manali, Goa, Varanasi..."
                  value={formData.destination}
                  onChange={e => {
                    setFormData({ ...formData, destination: e.target.value });
                    if (errors.destination) setErrors({ ...errors, destination: null });
                  }}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border ${
                    errors.destination ? 'border-pink-300 ring-2 ring-pink-100' : 'border-purple-100 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-100 text-sm font-medium`}
                />
              </div>
              {errors.destination && (
                <div className="flex items-center gap-1.5 text-xs text-pink-600 font-semibold mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.destination}</span>
                </div>
              )}

              {/* Quick Picks Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-stone-500 font-medium mr-1">Popular in India:</span>
                {INDIAN_QUICK_PICKS.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, destination: city });
                      setErrors({ ...errors, destination: null });
                    }}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100/90 text-amber-900 rounded-full border border-amber-200 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    {city.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Starting Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Starting Location <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. New Delhi, Mumbai, Bengaluru..."
                value={formData.starting_location}
                onChange={e => setFormData({ ...formData, starting_location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border border-purple-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-sm font-medium"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Start Date <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-purple-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-sm"
                  />
                </div>
                {errors.start_date && <p className="text-xs text-pink-500 mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  End Date <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-purple-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-sm"
                  />
                </div>
                {errors.end_date && <p className="text-xs text-pink-500 mt-1">{errors.end_date}</p>}
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Back to Explore
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-98 shadow-md shadow-pink-500/25 flex items-center gap-2 text-sm cursor-pointer transition-all"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4 text-pink-100" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Vibe & Interests (matching Page 11) */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vibe & Interests</h2>
              <p className="text-sm text-slate-500">Personalize your journey to match your style.</p>
            </div>

            {/* Travel Style Grid (Multi-select) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Travel Styles & Vibes <span className="text-purple-600 font-semibold normal-case">(Select 1 or more)</span>
                </label>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
                  {(formData.vibes || [formData.vibe]).length} selected
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRAVEL_STYLES.map(v => {
                  const Icon = v.icon;
                  const isSelected = (formData.vibes || [formData.vibe]).includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVibe(v.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-50/90 ring-2 ring-purple-400/30 shadow-xs' 
                          : 'border-slate-200 bg-white hover:border-purple-200 hover:bg-purple-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        {Icon ? (
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-slate-500'}`} />
                        ) : (
                          <Sparkles className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-slate-500'}`} />
                        )}
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-xs text-slate-900">{v.label}</div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{v.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Interests Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Core Interests (Select Any)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(item => {
                  const isSelected = formData.travel_interests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-purple-200 hover:bg-purple-50/50'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Pace */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Preferred Travel Pace
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['relaxed', 'balanced', 'packed'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, travel_pace: p })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wide transition-all ${
                      formData.travel_pace === p
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-2xl font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-98 shadow-md shadow-pink-500/25 flex items-center gap-2 text-sm cursor-pointer transition-all"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4 text-pink-100" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Final Logistics (matching Page 10) */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Final Logistics</h2>
              <p className="text-sm text-slate-500">The little things that make it perfect.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Group Size & Travelers */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Group Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.travelers_count}
                    onChange={e => setFormData({ ...formData, travelers_count: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 rounded-2xl border border-purple-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-sm text-center font-bold"
                  />
                  <select
                    value={formData.traveler_type}
                    onChange={e => setFormData({ ...formData, traveler_type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-2xl border border-purple-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-xs bg-white font-semibold"
                  >
                    <option value="solo">Solo</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>

              {/* Total Budget & Currency */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Total Budget ({formData.currency})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 relative">
                    <input
                      type="number"
                      min="500"
                      step="500"
                      value={formData.budget}
                      onChange={e => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-purple-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-sm font-bold"
                    />
                  </div>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-2 py-2.5 rounded-2xl border border-purple-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-xs bg-white font-bold"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* Accommodation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Stay Preference
                </label>
                <select
                  value={formData.accommodation_preference}
                  onChange={e => setFormData({ ...formData, accommodation_preference: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-purple-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-xs bg-white font-medium"
                >
                  <option value="Mid-range Hotel">Mid-range Hotel (Comfortable & Central)</option>
                  <option value="Heritage Haveli">Heritage Haveli / Boutique Stay</option>
                  <option value="Luxury Resort">Luxury 5-Star Resort</option>
                  <option value="Budget Hostel">Budget Hostel / Homestay</option>
                </select>
              </div>

              {/* Dietary */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Dietary Preference
                </label>
                <select
                  value={formData.dietary_preferences}
                  onChange={e => setFormData({ ...formData, dietary_preferences: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-purple-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-xs bg-white font-medium"
                >
                  <option value="Vegetarian">Pure Vegetarian</option>
                  <option value="Jain">Jain Friendly</option>
                  <option value="No restrictions">No restrictions (Local foodies)</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Halal">Halal</option>
                </select>
              </div>

            </div>

            {/* Additional notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Additional Notes or Special Requests <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Traveling with parents, want peaceful ghats early morning, love spicy street food..."
                value={formData.additional_instructions}
                onChange={e => setFormData({ ...formData, additional_instructions: e.target.value })}
                className="w-full px-4 py-2 rounded-2xl border border-purple-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 text-xs font-medium"
              />
            </div>

            {/* Step 3 Actions */}
            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-98 shadow-xl shadow-pink-500/25 flex items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed group transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Curating AI Itinerary...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform text-pink-200" />
                    <span>Generate Itinerary</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-pink-200" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </form>
    </div>
  );
}
