import React from 'react';
import { ArrowLeft, MapPin, User, Clock, Zap, AlertCircle } from 'lucide-react';
import { Bus } from '../types';
import { formatETA } from '../utils/distanceCalculator';

interface BusListProps {
  buses: Bus[];
  from: string;
  to: string;
  onBack: () => void;
  onTrackBus: (bus: Bus) => void;
}

export function BusList({ buses, from, to, onBack, onTrackBus }: BusListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Zap className="w-3 h-3" />;
      case 'stopped': return <AlertCircle className="w-3 h-3" />;
      case 'offline': return <AlertCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">Available Buses</h1>
              <p className="text-sm text-gray-500">{from} → {to}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4">
        {buses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Buses Found</h3>
            <p className="text-gray-500">No buses are currently running on this route. Please try again later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {buses.map((bus) => (
              <div key={bus.device_id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{bus.bus_number}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bus.status)}`}>
                          {getStatusIcon(bus.status)}
                          {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-sm">Driver: {bus.driver_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">Speed: {bus.current_location.speed} km/h</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {bus.eta_to_destination ? formatETA(bus.eta_to_destination) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">ETA</div>
                    </div>
                  </div>

                  {bus.next_stop && (
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Next Stop: {bus.next_stop.name}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onTrackBus(bus)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all"
                  >
                    Track Live Location
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}