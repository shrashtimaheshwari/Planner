import React from 'react';
import { Compass, Bookmark, PlusCircle, Sparkles } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  onTabChange, 
  onOpenSavedTrips, 
  onNewTrip, 
  savedCount, 
  healthStatus 
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#FDF8FD]/90 backdrop-blur-md border-b border-purple-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand: WanderPlan */}
        <div 
          onClick={() => onTabChange('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Compass Monogram with Pink-to-Purple Gradient Accent */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 p-[1px] shadow-sm group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center text-purple-600 group-hover:text-pink-600 transition-colors">
              <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg sm:text-xl tracking-wider bg-gradient-to-r from-purple-900 via-purple-800 to-pink-700 bg-clip-text text-transparent leading-tight">
              WANDERPLAN
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-purple-400 tracking-[0.18em] uppercase">
              AI JOURNEY STUDIO
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => {
              onTabChange('home');
              const el = document.getElementById('explore-gallery');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2 rounded-full text-xs font-semibold text-purple-900/80 hover:text-purple-950 hover:bg-purple-100/60 transition-colors cursor-pointer"
          >
            Explore Destinations
          </button>

          <button 
            onClick={onOpenSavedTrips}
            className="px-4 py-2 rounded-full text-xs font-semibold text-purple-900/80 hover:text-purple-950 hover:bg-purple-100/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-purple-500" />
            <span>Saved Journeys</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right CTA Button: Pink & Purple Gradient */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewTrip}
            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-98 rounded-full shadow-md shadow-pink-500/25 transition-all hover:scale-105 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-pink-100" />
            <span>Create Itinerary</span>
          </button>
        </div>

      </div>
    </header>
  );
}
