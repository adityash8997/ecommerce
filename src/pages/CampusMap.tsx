import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map as MapIcon, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { campusLocations } from '@/data/campusLocations';

const getCampusLocation = (campusNum: number) => campusLocations.find((c) => c.id === campusNum);

const CampusMap: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      <header className="p-6 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-green-400 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500">
              <MapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Campus Explorer</h1>
              <p className="text-sm text-white/70">Discover KIIT University</p>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Explore KIIT Campus
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Click any campus to view its location on the map
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campusLocations.map((campus) => (
            <div
              key={campus.id}
              onClick={() => navigate(`/campus-map/${campus.id}`)}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all hover:bg-white/20 hover:scale-105 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500">
                  <MapIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{campus.name}</h3>
                  <p className="text-xs text-white/70">{campus.fullName}</p>
                </div>
              </div>
              <p className="text-sm text-white/80">{campus.description}</p>
              <div className="mt-3 flex items-center gap-2">
                <Star className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-medium">
                  Click to view map
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Campus Maps Available!</h3>
            <p className="text-white/80 max-w-2xl mx-auto">
              Click on any campus tile above to view its location on the interactive map.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampusMap;