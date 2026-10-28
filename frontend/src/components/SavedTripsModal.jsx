import React from 'react';
import { X, Calendar, MapPin, Trash2, ArrowRight, Bookmark, Compass, IndianRupee, Layers } from 'lucide-react';

export default function SavedTripsModal({ 
  isOpen, 
  onClose, 
  savedTrips, 
  onSelectTrip, 
  onDeleteTrip, 
  isLoading 
}) {
  if (!isOpen) return null;

  const totalTrips = savedTrips.length;
  const uniqueDestinations = new Set(savedTrips.map(t => t.destination)).size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[85vh] z-10">
        
        {/* Header (matching Page 12) */}
        <div className="px-6 py-5 border-b border-purple-100 flex items-center justify-between bg-purple-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-xs">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Your Travel Dashboard</h2>
              <p className="text-xs text-purple-700 font-semibold">Persisted in Supabase Cloud Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-purple-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Widgets (matching Page 12) */}
        <div className="p-6 pb-2 grid grid-cols-3 gap-4 border-b border-purple-50">
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Trips</span>
            <span className="text-xl font-black text-purple-900">{totalTrips}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Destinations</span>
            <span className="text-xl font-black text-pink-900">{uniqueDestinations}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-fuchsia-50/60 border border-fuchsia-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Upcoming</span>
            <span className="text-xl font-black text-fuchsia-900">{totalTrips}</span>
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">Connecting to Supabase...</p>
            </div>
          ) : savedTrips.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <Compass className="w-12 h-12 text-purple-200 mx-auto" />
              <p className="text-base font-bold text-slate-800">No saved trips yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Generate an itinerary and click "Save Trip" to store your plans here.
              </p>
            </div>
          ) : (
            savedTrips.map(trip => {
              const currencySymbol = trip.currency === 'INR' ? '₹' : (trip.currency === 'USD' ? '$' : trip.currency);

              return (
                <div 
                  key={trip.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all bg-white flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                        {trip.vibe || 'balanced'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {trip.travelers_count} {trip.traveler_type || 'Travelers'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                      {trip.title || `Trip to ${trip.destination}`}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-pink-500" />
                        {trip.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                        {trip.start_date} → {trip.end_date}
                      </span>
                      <span className="font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {currencySymbol} {trip.budget?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTrip(trip);
                        onClose();
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 rounded-xl flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
                    >
                      <span>Open Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTrip(trip.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete trip from Supabase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-purple-50 bg-purple-50/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:bg-purple-100 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
