// Client-side fallback generator for seamless web demos
// Ensures the demo URL works flawlessly even if the backend is waking up or offline.

export function generateDemoItinerary(prefs) {
  const dest = prefs.destination ? prefs.destination.trim() : 'Goa, India';
  const currency = prefs.currency || 'INR';
  const pace = (prefs.travel_pace || 'balanced').toLowerCase();
  const vibe = prefs.vibe || 'romantic';

  // Calculate day count
  const start = new Date(prefs.start_date || Date.now());
  const end = new Date(prefs.end_date || (Date.now() + 3 * 86400000));
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const totalDays = Math.min(Math.max(diffDays, 1), 7);

  const budget = parseFloat(prefs.budget) || (currency === 'INR' ? 45000 : 1500);
  const dailyBudget = budget / totalDays;

  const themes = [
    `Arrival & ${dest} Heritage Orientation`,
    `Scenic Viewpoints & Historic Landmarks`,
    `Local Food Trails & Artisan Markets`,
    `Nature Escapes & Hidden Panoramas`,
    `Cultural Discovery & Evening Celebrations`,
    `Slow Morning & Waterfront Sunset Moments`,
    `Farewell Exploration & Souvenir Keepsakes`
  ];

  const days = [];
  let totalCost = 0;

  for (let i = 1; i <= totalDays; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + (i - 1));
    const dateStr = dayDate.toISOString().split('T')[0];
    const theme = themes[(i - 1) % themes.length];

    const morningCost = Math.round(dailyBudget * 0.18);
    const afternoonCost = Math.round(dailyBudget * 0.22);
    const eveningCost = Math.round(dailyBudget * 0.35);
    const dayCost = morningCost + afternoonCost + eveningCost;
    totalCost += dayCost;

    const activities = [
      {
        id: `act-${i}-morning`,
        period: 'morning',
        time: '09:00 AM - 11:30 AM',
        title: i === 1 ? `Welcome Walk & Landmark Orientation in ${dest}` : `Iconic Heritage & Architecture Walk`,
        description: `Explore the captivating surroundings of ${dest}. Discover atmospheric streets, historical monuments, and breathtaking photo vantage points.`,
        category: 'sightseeing',
        estimated_duration: '2.5 hours',
        estimated_cost: morningCost,
        transport_tip: '10-minute auto-rickshaw or scenic walking route from stay',
        dining_recommendation: `Popular local café & specialty breakfast hub in central ${dest}`,
        notes: 'Arrive early for soft morning sunlight and pleasant breezes.'
      },
      {
        id: `act-${i}-afternoon`,
        period: 'afternoon',
        time: '01:30 PM - 04:30 PM',
        title: `Artisanal Quarter & Cultural Immersion`,
        description: `Delve into vibrant local craft markets, heritage museums, and specialty tasting spots showcasing authentic regional traditions.`,
        category: 'culture',
        estimated_duration: '3 hours',
        estimated_cost: afternoonCost,
        transport_tip: 'Direct 12-minute taxi/cab or local shuttle',
        dining_recommendation: `Signature restaurant serving regional ${prefs.dietary_preferences || 'local delicacies'}`,
        notes: 'Great spot for handmade mementos and authentic souvenirs.'
      },
      {
        id: `act-${i}-evening`,
        period: 'evening',
        time: '06:00 PM - 09:30 PM',
        title: `Golden Hour Sunset Viewpoint & Ambient Dinner`,
        description: `Watch the sunset cast glowing pink and purple hues across ${dest}, followed by an unforgettable multi-course dinner with ambient lighting.`,
        category: 'food',
        estimated_duration: '3.5 hours',
        estimated_cost: eveningCost,
        transport_tip: 'Pre-booked rideshare or leisurely promenade stroll',
        dining_recommendation: `Rooftop / Waterfront dining terrace with panoramic views of ${dest}`,
        notes: 'Sunset is peak hour; advance table reservation recommended.'
      }
    ];

    days.push({
      day_number: i,
      date: dateStr,
      theme,
      activities,
      estimated_daily_cost: dayCost,
      accommodation_suggestion: `Comfort Stay in prime ${dest} (${prefs.accommodation_preference || 'Convenient central area'})`
    });
  }

  return {
    id: `trip_${Date.now()}`,
    destination: dest,
    starting_location: prefs.starting_location || 'Your Home City',
    start_date: prefs.start_date || start.toISOString().split('T')[0],
    end_date: prefs.end_date || end.toISOString().split('T')[0],
    total_days: totalDays,
    budget: budget,
    currency: currency,
    travelers_count: prefs.travelers_count || 2,
    traveler_type: prefs.traveler_type || 'couple',
    vibe: vibe,
    travel_pace: pace,
    summary: `A personalized ${totalDays}-day ${vibe} getaway in ${dest} curated for ${prefs.traveler_type || 'travelers'}. Blends iconic cultural highlights, picturesque viewpoints, authentic food spots, and relaxed logistics tailored to a ${pace} pace.`,
    overall_tips: [
      `Carry light cash in ${currency} for small vendor purchases and auto-rickshaws/taxis in ${dest}.`,
      `Keep digital copies of photo IDs and hotel vouchers handy on your smartphone.`,
      `Stay hydrated, dress comfortably for walking, and plan early departures for popular sunrise/sunset viewpoints.`,
      `Download offline maps for ${dest} to navigate seamlessly without cellular interruptions.`
    ],
    estimated_total_cost: totalCost,
    days
  };
}
