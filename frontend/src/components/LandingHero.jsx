import React from 'react';
import { 
  Sparkles, ArrowRight, Compass,
  UtensilsCrossed, CalendarClock, WalletCards, FileCheck2 
} from 'lucide-react';

export default function LandingHero({ onStartPlanning, onExploreClick }) {
  return (
    <div className="pt-8 sm:pt-14 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Hero Container */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        
        {/* Subtle AI Studio Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-950 via-stone-900 to-pink-950 text-pink-200 text-xs font-semibold tracking-wide border border-purple-700/40 shadow-sm hover:scale-105 transition-transform cursor-default">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Intelligent Travel Studio • Instant Day-by-Day Curation</span>
        </div>

        {/* Grand Serif Headline with Pink & Purple Accents */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-stone-900 tracking-tight leading-[1.14]">
          Where Will Curiosity{' '}
          <span className="italic font-serif text-purple-700">Take</span>{' '}
          <span className="font-serif bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
            You?
          </span>
        </h1>

        {/* Original Evocative Subtitle */}
        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Skip generic bucket lists and chaotic browser tabs. WanderPlan synthesizes local rhythms, authentic dining, and realistic travel pacing into an effortless day-by-day itinerary tailored to your style.
        </p>

        {/* Action Buttons in Pink & Purple Theme */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStartPlanning}
            className="px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-98 shadow-lg shadow-pink-500/25 flex items-center gap-2.5 transition-all hover:scale-105 group text-sm sm:text-base cursor-pointer"
          >
            <span>Design My Itinerary</span>
            <ArrowRight className="w-4 h-4 text-pink-200 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreClick || (() => {
              const el = document.getElementById('explore-gallery');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            })}
            className="px-7 py-3.5 rounded-full font-bold text-purple-950 bg-white hover:bg-pink-50/50 border border-purple-200/90 shadow-2xs flex items-center gap-2 transition-all hover:scale-105 text-sm sm:text-base cursor-pointer"
          >
            <Compass className="w-4 h-4 text-purple-600" />
            <span>Browse Destinations</span>
          </button>
        </div>

        {/* Divider */}
        <div className="pt-6">
          <div className="h-px w-full max-w-3xl mx-auto bg-purple-100" />
        </div>

        {/* 4 Authentic Travel Capability Pillars (with pink & purple accents) */}
        <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-5 text-left max-w-4xl mx-auto">
          
          <div className="p-3.5 rounded-2xl bg-white/80 border border-purple-100/90 shadow-2xs hover:border-pink-300 transition-colors space-y-1">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                <CalendarClock className="w-3.5 h-3.5" />
              </div>
              <span>Smart Pacing</span>
            </div>
            <p className="text-xs text-stone-500 leading-snug">
              Morning to night quadrants with zero rush.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-purple-100/90 shadow-2xs hover:border-purple-300 transition-colors space-y-1">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <UtensilsCrossed className="w-3.5 h-3.5" />
              </div>
              <span>Local Food Trails</span>
            </div>
            <p className="text-xs text-stone-500 leading-snug">
              Authentic regional thalis, cafes & street gems.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-purple-100/90 shadow-2xs hover:border-fuchsia-300 transition-colors space-y-1">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center">
                <WalletCards className="w-3.5 h-3.5" />
              </div>
              <span>Clear Budgets</span>
            </div>
            <p className="text-xs text-stone-500 leading-snug">
              Transparent ₹ estimates for stay, food & travel.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-purple-100/90 shadow-2xs hover:border-violet-300 transition-colors space-y-1">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                <FileCheck2 className="w-3.5 h-3.5" />
              </div>
              <span>One-Tap PDF</span>
            </div>
            <p className="text-xs text-stone-500 leading-snug">
              Download clean offline travel plans instantly.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
