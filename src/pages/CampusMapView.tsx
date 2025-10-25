import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Navigation, ExternalLink } from 'lucide-react';
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

  if (!campusData && campusId) {
    campusData = campusLocations.find((c) => String(c.id) === String(campusId));
  }

  if (!campusData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Campus not found</h1>
          <Button onClick={() => navigate('/campus-map')} className="bg-green-500 hover:bg-green-600">
            Back to Campus Map
          </Button>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${campusData.coordinates.lng - 0.015},${campusData.coordinates.lat - 0.015},${campusData.coordinates.lng + 0.015},${campusData.coordinates.lat + 0.015}&layer=mapnik&marker=${campusData.coordinates.lat},${campusData.coordinates.lng}`;
  const directionsUrl = campusData.mapsUrl || `https://www.google.com/maps?q=${campusData.coordinates.lat},${campusData.coordinates.lng}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-white/10 backdrop-blur-lg border-b border-white/10">
        <Button
          onClick={() => navigate('/campus-map')}
          variant="ghost"
          className="flex gap-2 items-center text-white hover:text-green-400 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campus Map
        </Button>
        <div>
          <h1 className="text-xl font-bold text-white">{campusData.fullName}</h1>
          <p className="text-sm text-white/70">{campusData.address}</p>
        </div>
      </header>

      {/* Body */}
      <main className="container p-6 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <iframe
              title={campusData.fullName}
              width="100%"
              height="600"
              frameBorder="0"
              src={mapUrl}
            ></iframe>
          </div>

          <Button
            onClick={() => window.open(directionsUrl, '_blank')}
            className="w-full h-14 text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Navigation className="w-5 h-5" />
            Get Directions
            <ExternalLink className="w-4 h-4" />
          </Button>

          <div className="mt-6 p-6 bg-white/10 backdrop-blur-md text-white rounded-xl border border-white/20">
            <h2 className="text-xl font-bold mb-2">{campusData.fullName}</h2>
            <p className="mb-2">{campusData.description}</p>
            <p className="text-sm text-white/70">
              Coordinates: {campusData.coordinates.lat.toFixed(6)}, {campusData.coordinates.lng.toFixed(6)}
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            📍 Points of Interest
          </h3>
          <ul className="text-white/90 space-y-3">
            <li>🍽 Food Court</li>
            <li>🏠 Girls Hostel</li>
            <li>🏘 Boys Hostel</li>
            <li>🏢 Main Building</li>
            <li>🎭 Auditorium</li>
            <li>🎪 Open Air Theatre</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default CampusMapView;