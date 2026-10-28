import React from 'react';
import { X, Star, Calendar, IndianRupee, Sparkles, MapPin, ArrowRight, Clock } from 'lucide-react';

export default function DestinationModal({ destination, isOpen, onClose, onStartPlanning }) {
  if (!isOpen || !destination) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-purple-100/80 overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
        
        {/* Left Side: Destination Visual Banner */}
        <div className="relative min-h-[260px] md:min-h-full overflow-hidden bg-stone-900">
          <img 
            src={destination.image} 
            alt={destination.name}
            className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/40 to-transparent" />

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Details */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950/80 text-pink-200 backdrop-blur-md border border-white/10 shadow-xs">
              <Sparkles className="w-3 h-3 text-pink-400" />
              {destination.vibeTag || destination.vibeCategory || 'Curated Edition'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-white drop-shadow-md">
              {destination.name}
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
              <span className="flex items-center gap-1 text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {destination.rating}
              </span>
              <span>•</span>
              <span>{destination.reviews || 'Curated'}</span>
              <span>•</span>
              <span className="text-pink-200 font-bold">{destination.priceLevel}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            
            {/* Desktop Close */}
            <div className="hidden md:flex justify-end -mt-2 -mr-2">
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-stone-400 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-pink-600 block mb-1">
                Curated Overview
              </span>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                {destination.poeticDescription || destination.overview}
              </p>
            </div>

            {/* Key Stats: Best Time & Duration/Budget */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-purple-50">
              <div className="p-3 rounded-2xl bg-pink-50/70 border border-pink-100">
                <span className="text-[10px] uppercase font-bold text-pink-800 flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-pink-600" /> Best Season
                </span>
                <p className="text-xs sm:text-sm font-bold text-stone-900">{destination.bestTime}</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
                <span className="text-[10px] uppercase font-bold text-purple-800 flex items-center gap-1 mb-1">
                  <IndianRupee className="w-3 h-3 text-purple-600" /> Budget Range
                </span>
                <p className="text-xs sm:text-sm font-bold text-stone-900">{destination.totalBudgetRange || destination.avgBudget}</p>
              </div>
            </div>

            {/* Signature Experiences Bullets */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-purple-800/80 block mb-2">
                Signature Experiences
              </span>
              <div className="space-y-1.5">
                {(destination.featureBullets || destination.highlights).map((h, i) => (
                  <div
                    key={i}
                    className="text-xs font-medium text-purple-950 px-3 py-1.5 rounded-xl bg-purple-50/60 border border-purple-100/70 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* CTA Button */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onStartPlanning(destination);
                onClose();
              }}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-98 shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-pink-200" />
              <span>Customize This Trip</span>
              <ArrowRight className="w-4 h-4 text-pink-100" />
            </button>
            <p className="text-[10px] text-center text-purple-400 font-semibold tracking-wider uppercase">
              Curate Dates, Travel Style & Accommodations
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
