import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Navigation, ExternalLink, UtensilsCrossed, Home, Building2, Theater, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { campusLocations, CampusLocation } from '@/data/campusLocations';

interface LocationState {
  state?: {
    campusData?: CampusLocation;
  };
}

const CampusMapView: React.FC = () => {
  const navigate = useNavigate();
  const { campusId } = useParams();
  const location = useLocation() as unknown as LocationState;
  let campusData = location.state?.campusData;

  // Fallback: get by params if not passed in location.state
  if (!campusData && campusId) {
    campusData = campusLocations.find(c => String(c.id) === String(campusId));
  }
  
  if (!campusData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Campus not found</h1>
          <Button onClick={() => navigate('/campus-map')} className="bg-green-500 hover:bg-green-600">
            Back to Campus Map
          </Button>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${campusData.coordinates.lng - 0.015},${campusData.coordinates.lat - 0.015},${campusData.coordinates.lng + 0.015},${campusData.coordinates.lat + 0.015}&layer=mapnik&marker=${campusData.coordinates.lat},${campusData.coordinates.lng}`;
  const directionsUrl = `https://maps.olakrutrim.com/directions?destination=${campusData.coordinates.lat},${campusData.coordinates.lng}`;

  // Points of Interest data
  const pointsOfInterest = [
    { icon: UtensilsCrossed, label: 'Food Court', emoji: '🍽' },
    { icon: Home, label: 'Girls Hostel', emoji: '🏠' },
    { icon: Home, label: 'Boys Hostel', emoji: '🏘' },
    { icon: Building2, label: 'Main Building', emoji: '🏢' },
    { icon: Theater, label: 'Auditorium', emoji: '🎭' },
    { icon: Music, label: 'Open Air Theatre', emoji: '🎪' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      {/* Header */}
      <header className="p-6 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/campus-map')}
            className="flex items-center gap-2 text-white hover:text-green-400 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campus Map
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">{campusData.fullName}</h1>
            <p className="text-sm text-white/70">{campusData.address}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Map and Directions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Container */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <iframe
                title={`${campusData.fullName} Location Map`}
                width="100%"
                height="600"
                frameBorder="0"
                src={mapUrl}
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Get Directions Button */}
            <Button
              onClick={() => window.open(directionsUrl, '_blank')}
              className="w-full h-14 text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
              <ExternalLink className="w-4 h-4" />
            </Button>

            {/* Campus Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">{campusData.fullName}</h3>
              <div className="space-y-3 text-white/80">
                <p><strong>Address:</strong> {campusData.address}</p>
                <p><strong>Coordinates:</strong> {campusData.coordinates.lat.toFixed(6)}, {campusData.coordinates.lng.toFixed(6)}</p>
                <p><strong>Description:</strong> {campusData.description}</p>
              </div>
            </div>
          </div>

          {/* Right Side - Points of Interest */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 sticky top-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📍</span> Points of Interest
              </h3>
              <ul className="space-y-4">
                {pointsOfInterest.map((poi, index) => {
                  const Icon = poi.icon;
                  return (
                    <li 
                      key={index}
                      className="flex items-center gap-3 text-white/90 hover:text-white hover:bg-white/10 p-3 rounded-lg transition-all cursor-pointer"
                    >
                      <span className="text-2xl">{poi.emoji}</span>
                      <Icon className="w-5 h-5 text-green-400" />
                      <span className="font-medium">{poi.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampusMapView;