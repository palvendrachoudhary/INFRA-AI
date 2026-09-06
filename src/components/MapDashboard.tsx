import React, { useState, useEffect } from 'react';
import { CrazyMap } from './map/CrazyMap';
import { SeherDrawer } from './drawer/SeherDrawer';
import { CityData, MOCK_CITIES } from '../lib/mockData';

export function MapDashboard({ initialCity }: { initialCity?: string | null }) {
  const [activeCity, setActiveCity] = useState<CityData | null>(() => {
    if (initialCity && MOCK_CITIES[initialCity]) {
      return MOCK_CITIES[initialCity];
    }
    return null;
  });

  useEffect(() => {
    if (initialCity && MOCK_CITIES[initialCity]) {
      setActiveCity(MOCK_CITIES[initialCity]);
    }
  }, [initialCity]);

  return (
    <div className="w-full h-full min-h-[500px] flex-1 flex flex-col relative overflow-hidden map-dashboard-container">
      {/* Crazy Map Area */}
      <div className="w-full h-full flex-1 min-h-0 relative map-container-wrapper">
         <CrazyMap 
            onCityClick={(city) => setActiveCity(city)} 
            activeCity={activeCity} 
         />
      </div>

      {/* Seher Intelligence Drawer Overlay */}
      {activeCity && (
        <SeherDrawer 
          city={activeCity} 
          onClose={() => setActiveCity(null)} 
        />
      )}
    </div>
  );
}
