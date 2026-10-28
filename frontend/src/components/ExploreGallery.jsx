import React, { useState } from 'react';
import { 
  Sparkles, Star, MapPin, Clock, ArrowRight, Eye 
} from 'lucide-react';
import { TRENDING_DESTINATIONS } from '../data/destinations';

const VIBE_FILTERS = [
  { id: 'All', label: 'All Journeys' },
  { id: 'Heritage & Culture', label: 'Heritage & Culture' },
  { id: 'Romantic Getaways', label: 'Romantic Getaways' },
  { id: 'Himalayan Escapes', label: 'Himalayan Escapes' },
  { id: 'Culinary Trails', label: 'Culinary Trails' },
  { id: 'Coastal & Tropics', label: 'Coastal & Tropics' },
  { id: 'Spiritual Retreats', label: 'Spiritual Retreats' },
];

export default function ExploreGallery({ onSelectDestination, onStartPlanning }) {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filtered = selectedFilter === 'All'
    ? TRENDING_DESTINATIONS
    : TRENDING_DESTINATIONS.filter(d => d.vibeCategory === selectedFilter);

  return (
    <section id="explore-gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-[11px] font-bold tracking-wider uppercase border border-pink-200/60">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Curated Travel Inspirations</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">
          Handcrafted Journeys Across India
        </h2>

        <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed">
          From tranquil backwaters and regal palaces to snowbound mountain trails. Preview the daily flow or customize any itinerary to match your rhythm.
        </p>
      </div>

      {/* Vibe Filter Pills Row with Pink & Purple Styling */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
        {VIBE_FILTERS.map(filter => {
          const isSelected = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'bg-white hover:bg-pink-50/50 text-purple-950 border border-purple-100 shadow-2xs'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Destination Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {filtered.map(dest => (
          <div
            key={dest.id}
            className="group bg-white rounded-3xl border border-purple-100/90 shadow-2xs hover:shadow-xl hover:border-pink-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Top Visual Image with Overlays */}
            <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-stone-900 shrink-0">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/85 via-purple-950/30 to-transparent" />

              {/* Vibe Pill Tag on Top-Left */}
              <div className="absolute top-3.5 left-3.5">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950/80 text-pink-200 backdrop-blur-md border border-white/10 shadow-2xs">
                  {dest.vibeTag || dest.vibeCategory}
                </span>
              </div>

              {/* Star Rating on Top-Right */}
              <div className="absolute top-3.5 right-3.5">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-stone-900 shadow-2xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{dest.rating}</span>
                </span>
              </div>

              {/* Title & Region Overlay on Bottom of Image */}
              <div className="absolute bottom-3.5 left-4 right-4 text-white">
                <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-xs">
                  {dest.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-pink-200/90 font-medium mt-0.5">
                  <MapPin className="w-3 h-3 text-pink-300" />
                  <span>{dest.locationRegion || 'India'}</span>
                </div>
              </div>
            </div>

            {/* Card Content Body */}
            <div className="p-5 space-y-4 flex flex-col justify-between flex-1">
              
              <div className="space-y-3">
                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-2">
                  {dest.poeticDescription || dest.overview}
                </p>

                {/* Duration & Budget Badges */}
                <div className="flex items-center justify-between text-xs py-1.5 border-y border-purple-50">
                  <span className="flex items-center gap-1.5 font-semibold text-stone-700">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{dest.durationBadge || '4 Days • 3 Nights'}</span>
                  </span>
                  <span className="flex items-center gap-1 font-bold text-purple-800 bg-purple-50/90 px-2.5 py-0.5 rounded-full border border-purple-200/50">
                    <span>{dest.totalBudgetRange || dest.avgBudget}</span>
                  </span>
                </div>

                {/* Highlight Bullets */}
                {dest.featureBullets && (
                  <div className="space-y-1.5 pt-0.5">
                    {dest.featureBullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-purple-900 bg-purple-50/70 px-2.5 py-1 rounded-lg border border-purple-100/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                        <span className="truncate font-medium">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDestination(dest);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-purple-950 bg-white hover:bg-pink-50/50 border border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-purple-500" />
                  <span>Quick View</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onStartPlanning) {
                      onStartPlanning(dest);
                    } else {
                      onSelectDestination(dest);
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-xs hover:scale-[1.02] cursor-pointer"
                >
                  <span>Customize Trip</span>
                  <ArrowRight className="w-3.5 h-3.5 text-pink-100" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
