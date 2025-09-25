import React, { useState } from 'react';
import { SearchPage } from './components/SearchPage';
import { BusList } from './components/BusList';
import { LiveTracking } from './components/LiveTracking';
import { Bus } from './types';
import { mockBuses, mockRoutes } from './data/mockData';
import { calculateDistance, calculateETA } from './utils/distanceCalculator';

type AppState = 
  | { view: 'search' }
  | { view: 'buses'; from: string; to: string; buses: Bus[] }
  | { view: 'tracking'; bus: Bus };

function App() {
  const [state, setState] = useState<AppState>({ view: 'search' });

  const handleSearch = (from: string, to: string) => {
    // Find route that matches the search
    const route = mockRoutes.find(r => 
      r.from.toLowerCase().includes(from.toLowerCase()) ||
      r.to.toLowerCase().includes(to.toLowerCase()) ||
      from.toLowerCase().includes(r.from.toLowerCase()) ||
      to.toLowerCase().includes(r.to.toLowerCase())
    );

    let availableBuses = mockBuses;

    // If we found a matching route, filter buses for that route
    if (route) {
      availableBuses = mockBuses.filter(bus => bus.route_id === route.id);
    }

    // Calculate updated ETAs for each bus based on search destination
    const busesWithUpdatedETA = availableBuses.map(bus => {
      // Find the destination stop
      const destinationStop = route?.stops.find(stop => 
        stop.name.toLowerCase().includes(to.toLowerCase())
      );

      if (destinationStop) {
        const distance = calculateDistance(
          bus.current_location.lat,
          bus.current_location.lon,
          destinationStop.lat,
          destinationStop.lon
        );
        const eta = calculateETA(distance, bus.current_location.speed);
        
        return {
          ...bus,
          eta_to_destination: typeof eta === 'number' ? eta : 0
        };
      }

      return bus;
    });

    setState({
      view: 'buses',
      from,
      to,
      buses: busesWithUpdatedETA
    });
  };

  const handleTrackBus = (bus: Bus) => {
    setState({ view: 'tracking', bus });
  };

  const handleBack = () => {
    setState({ view: 'search' });
  };

  const handleBackToBuses = () => {
    if (state.view === 'tracking') {
      // Can't go back to buses view without search params
      setState({ view: 'search' });
    }
  };

  switch (state.view) {
    case 'search':
      return <SearchPage onSearch={handleSearch} />;
    
    case 'buses':
      return (
        <BusList
          buses={state.buses}
          from={state.from}
          to={state.to}
          onBack={handleBack}
          onTrackBus={handleTrackBus}
        />
      );
    
    case 'tracking':
      return (
        <LiveTracking
          bus={state.bus}
          onBack={handleBackToBuses}
        />
      );
    
    default:
      return <SearchPage onSearch={handleSearch} />;
  }
}

export default App;