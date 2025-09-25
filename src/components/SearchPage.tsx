import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { RecentSearch } from '../types';
import { popularSearches } from '../data/mockData';

interface SearchPageProps {
  onSearch: (from: string, to: string) => void;
}

export function SearchPage({ onSearch }: SearchPageProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [recentSearches, setRecentSearches] = useLocalStorage<RecentSearch[]>('recent_searches', []);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = () => {
    if (from.trim() && to.trim()) {
      // Add to recent searches
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        from: from.trim(),
        to: to.trim(),
        timestamp: new Date().toISOString()
      };
      
      const updatedSearches = [newSearch, ...recentSearches.filter(s => 
        !(s.from === newSearch.from && s.to === newSearch.to)
      )].slice(0, 5);
      
      setRecentSearches(updatedSearches);
      onSearch(from.trim(), to.trim());
    }
  };

  const handleRecentSearchClick = (search: RecentSearch) => {
    setFrom(search.from);
    setTo(search.to);
    onSearch(search.from, search.to);
  };

  const handlePopularSearchClick = (search: typeof popularSearches[0]) => {
    setFrom(search.from);
    setTo(search.to);
    onSearch(search.from, search.to);
  };

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Smart Bus</h1>
              <p className="text-sm text-gray-500">Track your ride</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Plan Your Journey</h2>
              </div>
              
              {/* From Location */}
              <div className="relative mb-3">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full"></div>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="From (departure location)"
                  className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-green-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-2 z-10 relative">
                <button
                  onClick={swapLocations}
                  className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <ArrowRight className="w-4 h-4 text-gray-600 rotate-90" />
                </button>
              </div>

              {/* To Location */}
              <div className="relative mt-3">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="To (destination)"
                  className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-red-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={!from.trim() || !to.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none"
            >
              Find Available Buses
            </button>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Popular Routes</h3>
          </div>
          <div className="space-y-2">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handlePopularSearchClick(search)}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 font-medium group-hover:text-blue-600">
                      {search.from} → {search.to}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Recent Searches</h3>
            </div>
            <div className="space-y-2">
              {recentSearches.slice(0, 3).map((search) => (
                <button
                  key={search.id}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 font-medium group-hover:text-blue-600">
                        {search.from} → {search.to}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(search.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}