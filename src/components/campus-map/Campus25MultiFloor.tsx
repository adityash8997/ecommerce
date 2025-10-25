import React, { useState } from 'react';
import { ArrowLeft, Search, MapPin, Users, Monitor, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Room {
  id: string;
  label: string;
  type: 'classroom' | 'lab' | 'office' | 'washroom' | 'common' | 'lift' | 'stairs' | 'library' | 'theatre';
  x: number;
  y: number;
  width: number;
  height: number;
  description?: string;
}

// Complete Ground Floor Rooms (your working version)
const groundFloorRooms: Room[] = [
  // A Block - Bottom row with proper spacing
  { id: 'A001', label: 'A001', type: 'classroom', x: 120, y: 480, width: 55, height: 35 },
  { id: 'A002', label: 'A002', type: 'lab', x: 185, y: 480, width: 55, height: 35, description: 'Research' },
  { id: 'A003', label: 'A003', type: 'classroom', x: 250, y: 480, width: 55, height: 35 },
  { id: 'A004', label: 'A004', type: 'lab', x: 315, y: 480, width: 55, height: 35, description: 'IOT' },
  { id: 'A005', label: 'A005', type: 'classroom', x: 380, y: 480, width: 55, height: 35 },

  // A Block - Second row with spacing
  { id: 'A006', label: 'A006', type: 'classroom', x: 185, y: 430, width: 55, height: 35 },
  { id: 'A007', label: 'A007', type: 'classroom', x: 250, y: 430, width: 55, height: 35 },
  { id: 'A008', label: 'A008', type: 'classroom', x: 315, y: 430, width: 55, height: 35 },
  { id: 'A009', label: 'A009', type: 'classroom', x: 120, y: 380, width: 55, height: 35 },
  { id: 'A010', label: 'A010', type: 'classroom', x: 185, y: 380, width: 55, height: 35 },

  // A Block - Upper section with spacing
  { id: 'A015', label: 'A015', type: 'classroom', x: 315, y: 330, width: 55, height: 35 },
  { id: 'A017', label: 'A017', type: 'classroom', x: 380, y: 430, width: 55, height: 35 },
  { id: 'A018', label: 'A018', type: 'classroom', x: 380, y: 380, width: 55, height: 35 },

  // B Block - Top section with proper spacing
  { id: 'B001', label: 'B001', type: 'classroom', x: 520, y: 100, width: 55, height: 35 },
  { id: 'B002', label: 'B002', type: 'classroom', x: 585, y: 100, width: 55, height: 35 },
  { id: 'B003', label: 'B003', type: 'classroom', x: 650, y: 100, width: 55, height: 35 },
  { id: 'B004', label: 'B004', type: 'classroom', x: 715, y: 100, width: 55, height: 35 },

  // B Block - Middle section with spacing
  { id: 'B007', label: 'B007', type: 'classroom', x: 520, y: 150, width: 55, height: 35 },
  { id: 'B008', label: 'B008', type: 'classroom', x: 585, y: 150, width: 55, height: 35 },
  { id: 'B009', label: 'B009', type: 'classroom', x: 520, y: 200, width: 55, height: 35 },
  { id: 'B010', label: 'B010', type: 'classroom', x: 585, y: 200, width: 55, height: 35 },

  // B Block - Lower section with spacing
  { id: 'B011', label: 'B011', type: 'classroom', x: 460, y: 250, width: 55, height: 35 },
  { id: 'B012', label: 'B012', type: 'classroom', x: 460, y: 300, width: 55, height: 35 },
  { id: 'B013', label: 'B013', type: 'classroom', x: 525, y: 300, width: 55, height: 35 },
  { id: 'B015', label: 'B015', type: 'classroom', x: 395, y: 300, width: 55, height: 35 },
  { id: 'B016', label: 'B016', type: 'classroom', x: 650, y: 200, width: 55, height: 35 },
  { id: 'B017', label: 'B017', type: 'classroom', x: 585, y: 250, width: 55, height: 35 },

  // B Block - Right section with spacing
  { id: 'B018', label: 'B018', type: 'classroom', x: 715, y: 200, width: 55, height: 35 },
  { id: 'B019', label: 'B019', type: 'classroom', x: 715, y: 250, width: 55, height: 35 },
  { id: 'B020', label: 'B020', type: 'classroom', x: 715, y: 150, width: 55, height: 35 },
  { id: 'B021', label: 'B021', type: 'classroom', x: 650, y: 250, width: 55, height: 35 },
  { id: 'B022', label: 'B022', type: 'classroom', x: 780, y: 150, width: 55, height: 35 },

  // C Block - Special areas with spacing
  { id: 'C001', label: 'C001', type: 'classroom', x: 590, y: 300, width: 55, height: 35 },
  { id: 'C012', label: 'C012', type: 'common', x: 870, y: 450, width: 70, height: 35, description: 'Seminar Halls' },
  { id: 'C013', label: 'C013', type: 'common', x: 870, y: 400, width: 70, height: 35, description: 'Seminar Halls' },

  // Special Areas with proper spacing
  { id: 'CAFETERIA', label: 'Cafeteria', type: 'common', x: 870, y: 300, width: 100, height: 60 },
  { id: 'DIRECTOR_OFFICE', label: 'Director Office', type: 'office', x: 780, y: 200, width: 80, height: 45, description: 'Director General Office' },
  { id: 'OPEN_SEATING', label: 'Open Seating Area', type: 'common', x: 780, y: 100, width: 80, height: 40 },
  { id: 'FACULTY_SEATING', label: 'Faculty Seating Area', type: 'common', x: 780, y: 255, width: 80, height: 35 },
  { id: 'STUDENTS_SEATING', label: 'Students Seating Area', type: 'common', x: 780, y: 350, width: 80, height: 35 },

  // Lifts - spaced properly
  { id: 'LIFT1', label: 'Lift 1', type: 'lift', x: 445, y: 480, width: 20, height: 20 },
  { id: 'LIFT3', label: 'Lift 3', type: 'lift', x: 380, y: 330, width: 20, height: 20 },
  { id: 'LIFT4', label: 'Lift 4', type: 'lift', x: 250, y: 330, width: 20, height: 20 },
  { id: 'LIFT6', label: 'Lift 6', type: 'lift', x: 270, y: 300, width: 20, height: 20 },
  { id: 'LIFT8', label: 'Lift 8', type: 'lift', x: 720, y: 95, width: 20, height: 20 },
  { id: 'LIFT9', label: 'Lift 9', type: 'lift', x: 500, y: 95, width: 20, height: 20 },
  { id: 'LIFT10', label: 'Lift 10', type: 'lift', x: 460, y: 95, width: 20, height: 20 },
  { id: 'LIFT11', label: 'Lift 11', type: 'lift', x: 460, y: 195, width: 20, height: 20 },
  { id: 'LIFT12', label: 'Lift 12', type: 'lift', x: 395, y: 245, width: 20, height: 20 },
  { id: 'LIFT16', label: 'Lift 16', type: 'lift', x: 780, y: 145, width: 20, height: 20 },
  { id: 'LIFT19', label: 'Lift 19', type: 'lift', x: 750, y: 350, width: 20, height: 20 },

  // Washrooms - spaced properly
  { id: 'WASHROOM_GENTS1', label: 'Washroom Gents', type: 'washroom', x: 100, y: 280, width: 60, height: 25 },
  { id: 'WASHROOM_LADIES1', label: 'Washroom Ladies', type: 'washroom', x: 100, y: 245, width: 60, height: 25 },
  { id: 'WASHROOM_LADIES2', label: 'Washroom Ladies', type: 'washroom', x: 460, y: 95, width: 55, height: 25 },
  { id: 'WASHROOM_GENTS2', label: 'Washroom Gents', type: 'washroom', x: 650, y: 95, width: 55, height: 25 },
  { id: 'STAFF_TOILET', label: 'Staff Toilet', type: 'washroom', x: 500, y: 350, width: 55, height: 25 },

  // Water Coolers - small and spaced
  { id: 'WATER_COOLER1', label: 'Water Cooler', type: 'common', x: 170, y: 330, width: 15, height: 15 },
  { id: 'WATER_COOLER2', label: 'Water Cooler', type: 'common', x: 650, y: 95, width: 15, height: 15 },
  { id: 'WATER_COOLER3', label: 'Water Cooler', type: 'common', x: 750, y: 300, width: 15, height: 15 },
  { id: 'WATER_COOLER4', label: 'Water Cooler', type: 'common', x: 750, y: 450, width: 15, height: 15 },

  // Stairs - spaced properly
  { id: 'STAIRS1', label: 'Stairs', type: 'stairs', x: 190, y: 330, width: 25, height: 35 },
  { id: 'STAIRS2', label: 'Stairs', type: 'stairs', x: 350, y: 330, width: 25, height: 35 },
  { id: 'STAIRS3', label: 'Stairs', type: 'stairs', x: 500, y: 330, width: 25, height: 35 },
  { id: 'STAIRS4', label: 'Stairs', type: 'stairs', x: 720, y: 95, width: 25, height: 35 },
  { id: 'STAIRS5', label: 'Stairs', type: 'stairs', x: 415, y: 480, width: 25, height: 35 },
  { id: 'STAIRS6', label: 'Stairs', type: 'stairs', x: 750, y: 480, width: 25, height: 35 },

  // Gates - small and spaced
  { id: 'GATE1', label: 'Gate', type: 'common', x: 500, y: 305, width: 30, height: 12 },
  { id: 'GATE2', label: 'Gate', type: 'common', x: 590, y: 305, width: 30, height: 12 },
];

// Function to convert ground floor rooms to other floors by changing room numbers
const createFloorRooms = (baseRooms: Room[], floorNumber: number): Room[] => {
  return baseRooms.map(room => {
    if (room.type === 'classroom' || room.type === 'lab' || room.type === 'office') {
      // Convert room numbers (A001 -> A101, B007 -> B207, etc.)
      const newLabel = room.label.replace(/(\d)(\d{2})/, `${floorNumber}$2`);
      return {
        ...room,
        id: newLabel,
        label: newLabel
      };
    }
    // For non-room facilities, append floor identifier
    return {
      ...room,
      id: `${room.id}_${floorNumber}F`,
      label: room.label
    };
  }).filter(room => {
    // Remove ground-floor specific items from upper floors
    if (floorNumber > 0) {
      const excludeItems = ['CAFETERIA', 'DIRECTOR_OFFICE'];
      return !excludeItems.includes(room.label);
    }
    return true;
  });
};

// Generate floor-specific additions
const getFloorSpecificRooms = (floorNumber: number): Room[] => {
  switch (floorNumber) {
    case 1:
      return [
        { id: 'C104', label: 'C104', type: 'classroom', x: 870, y: 200, width: 55, height: 35 },
        { id: 'C105', label: 'C105', type: 'classroom', x: 870, y: 250, width: 55, height: 35 },
        { id: 'C106', label: 'C106', type: 'classroom', x: 870, y: 300, width: 55, height: 35 },
        { id: 'CONFERENCE_HALL_1F', label: 'Conference Hall', type: 'common', x: 870, y: 350, width: 100, height: 60 },
        { id: 'FACULTY_CHAMBERS_1F', label: 'Faculty Chambers', type: 'office', x: 870, y: 420, width: 100, height: 40 },
      ];
    case 2:
      return [
        { id: 'C203', label: 'C203', type: 'office', x: 870, y: 200, width: 100, height: 80, description: 'Society Office' },
        { id: 'LT4', label: 'LT4', type: 'theatre', x: 870, y: 300, width: 80, height: 35, description: 'Lecture Theatre 4' },
        { id: 'LT5', label: 'LT5', type: 'theatre', x: 870, y: 350, width: 80, height: 35, description: 'Lecture Theatre 5' },
        { id: 'LT6', label: 'LT6', type: 'theatre', x: 870, y: 400, width: 80, height: 35, description: 'Lecture Theatre 6' },
      ];
    case 3:
      return [
        { id: 'LIBRARY', label: 'Library', type: 'library', x: 870, y: 200, width: 100, height: 120 },
        { id: 'CONFERENCE_HALL_3F', label: 'Conference Hall', type: 'common', x: 870, y: 330, width: 100, height: 60 },
        { id: 'FACULTY_CHAMBERS_3F', label: 'Faculty Chambers', type: 'office', x: 870, y: 400, width: 100, height: 40 },
      ];
    default:
      return [];
  }
};

type FloorType = 'ground' | 'first' | 'second' | 'third';

const floorData = {
  ground: { 
    rooms: [...groundFloorRooms], 
    title: 'Ground Floor' 
  },
  first: { 
    rooms: [...createFloorRooms(groundFloorRooms, 1), ...getFloorSpecificRooms(1)], 
    title: 'First Floor' 
  },
  second: { 
    rooms: [...createFloorRooms(groundFloorRooms, 2), ...getFloorSpecificRooms(2)], 
    title: 'Second Floor' 
  },
  third: { 
    rooms: [...createFloorRooms(groundFloorRooms, 3), ...getFloorSpecificRooms(3)], 
    title: 'Third Floor' 
  },
};

interface Campus25MultiFloorFixedProps {
  onBack: () => void;
}

const Campus25MultiFloorFixed: React.FC<Campus25MultiFloorFixedProps> = ({ onBack }) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFloor, setCurrentFloor] = useState<FloorType>('ground');

  const currentRooms = floorData[currentFloor].rooms;

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Search across all floors
      let foundRoom: Room | undefined;
      let foundFloor: FloorType | undefined;

      Object.entries(floorData).forEach(([floor, data]) => {
        const room = data.rooms.find(room => 
          room.id.toLowerCase().includes(query.toLowerCase()) ||
          room.label.toLowerCase().includes(query.toLowerCase())
        );
        if (room && !foundRoom) {
          foundRoom = room;
          foundFloor = floor as FloorType;
        }
      });

      if (foundRoom && foundFloor) {
        setCurrentFloor(foundFloor);
        setSelectedRoom(foundRoom);
      }
    }
  };

  const getRoomColor = (room: Room) => {
    if (selectedRoom?.id === room.id) return '#22c55e';
    switch (room.type) {
      case 'classroom': return '#dbeafe';
      case 'lab': return '#e0e7ff';
      case 'office': return '#fde68a';
      case 'common': return '#dcfce7';
      case 'library': return '#f3e8ff';
      case 'theatre': return '#fed7d7';
      case 'lift': return '#d1d5db';
      case 'washroom': return '#fecaca';
      case 'stairs': return '#f3f4f6';
      default: return '#f9fafb';
    }
  };

  const getRoomStroke = (room: Room) => {
    if (selectedRoom?.id === room.id) return '#16a34a';
    return '#6b7280';
  };

  // "You are here" location (same for all floors - main entrance)
  const currentLocation = { x: 260, y: 530, label: 'Main Gate (KP 25)' };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Campus Map
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campus 25</h1>
              <p className="text-gray-600">School of Agricultural Sciences - {floorData[currentFloor].title}</p>
            </div>
          </div>
          
          {selectedRoom && (
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">{selectedRoom.label}</div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRoom(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search rooms across all floors (e.g., A213, B105)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Floor Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-white rounded-lg border shadow-sm">
            <Button 
              variant={currentFloor === 'ground' ? 'default' : 'ghost'} 
              className="rounded-r-none"
              onClick={() => setCurrentFloor('ground')}
            >
              Ground Floor
            </Button>
            <Button 
              variant={currentFloor === 'first' ? 'default' : 'ghost'} 
              className="rounded-none"
              onClick={() => setCurrentFloor('first')}
            >
              First Floor
            </Button>
            <Button 
              variant={currentFloor === 'second' ? 'default' : 'ghost'} 
              className="rounded-none"
              onClick={() => setCurrentFloor('second')}
            >
              Second Floor
            </Button>
            <Button 
              variant={currentFloor === 'third' ? 'default' : 'ghost'} 
              className="rounded-l-none"
              onClick={() => setCurrentFloor('third')}
            >
              Third Floor
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Floor Plan SVG */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">You are here (Ground Floor Entrance)</span>
            </div>
            
            <div className="bg-white rounded-lg border shadow-sm p-4 overflow-auto">
              <svg viewBox="0 0 1100 600" className="w-full h-auto" style={{ minHeight: '600px' }}>
                {/* Building outline */}
                <rect x="80" y="80" width="940" height="480" fill="#f8fafc" stroke="#374151" strokeWidth="3" rx="8" />
                
                {/* Main structural lines */}
                <line x1="80" y1="320" x2="1020" y2="320" stroke="#374151" strokeWidth="3" />
                <line x1="460" y1="80" x2="460" y2="560" stroke="#374151" strokeWidth="2" />
                <line x1="770" y1="80" x2="770" y2="560" stroke="#374151" strokeWidth="2" />
                
                {/* Block boundaries */}
                <rect x="100" y="340" width="350" height="200" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" />
                <rect x="480" y="90" width="290" height="220" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" />
                <rect x="790" y="90" width="200" height="450" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" />

                {/* Main entrances - only show on ground floor */}
                {currentFloor === 'ground' && (
                  <>
                    <rect x="230" y="565" width="120" height="25" fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx="4" />
                    <text x="290" y="580" textAnchor="middle" fontSize="10" fill="#92400e" fontWeight="bold">
                      Campus 25 Main Gate (KP 25)
                    </text>
                    
                    <rect x="870" y="55" width="100" height="20" fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx="4" />
                    <text x="920" y="67" textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="bold">
                      Campus 25 Second Entrance (QC 19/25 Side)
                    </text>
                  </>
                )}

                {/* Rooms for current floor */}
                {currentRooms.map((room) => (
                  <g key={room.id}>
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.height}
                      fill={getRoomColor(room)}
                      stroke={getRoomStroke(room)}
                      strokeWidth={selectedRoom?.id === room.id ? "2" : "1"}
                      rx="3"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleRoomClick(room)}
                    />
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={room.width > 50 ? "9" : "8"}
                      fill="#374151"
                      fontWeight="600"
                      className="pointer-events-none select-none"
                    >
                      {room.label}
                    </text>
                    {room.description && room.width > 60 && (
                      <text
                        x={room.x + room.width / 2}
                        y={room.y + room.height / 2 + 12}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="6"
                        fill="#6b7280"
                        className="pointer-events-none select-none"
                      >
                        {room.description}
                      </text>
                    )}
                  </g>
                ))}

                {/* "You are here" pin - only on ground floor */}
                {currentFloor === 'ground' && (
                  <g transform={`translate(${currentLocation.x}, ${currentLocation.y})`}>
                    <circle cx="0" cy="0" r="6" fill="#22c55e" stroke="white" strokeWidth="2" />
                    <circle cx="0" cy="0" r="12" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.5">
                      <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x="15" y="5" fontSize="10" fill="#16a34a" fontWeight="bold">
                      You are here
                    </text>
                  </g>
                )}

                {/* Block Labels */}
                <text x="275" y="440" textAnchor="middle" fontSize="14" fill="#374151" fontWeight="bold">A Block</text>
                <text x="625" y="200" textAnchor="middle" fontSize="14" fill="#374151" fontWeight="bold">B Block</text>
                <text x="890" y="315" textAnchor="middle" fontSize="14" fill="#374151" fontWeight="bold">C Block</text>

                {/* Floor indicator */}
                <text x="550" y="50" textAnchor="middle" fontSize="16" fill="#374151" fontWeight="bold">
                  {floorData[currentFloor].title}
                </text>

                {/* Directional arrows */}
                <g>
                  <path d="M 275 310 L 275 295" stroke="#374151" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="280" y="307" fontSize="8" fill="#374151">Towards A Block</text>
                </g>
                
                <g>
                  <path d="M 625 310 L 625 295" stroke="#374151" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="630" y="307" fontSize="8" fill="#374151">Towards B Block</text>
                </g>
                
                <g>
                  <path d="M 890 310 L 890 295" stroke="#374151" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="895" y="307" fontSize="8" fill="#374151">Towards C Block</text>
                </g>

                {/* Arrow marker definition */}
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#374151" />
                  </marker>
                </defs>
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-4 bg-white rounded-lg border shadow-sm p-4">
              <h3 className="font-semibold mb-3">Legend</h3>
              <div className="grid grid-cols-3 md:grid-cols-8 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-gray-400 rounded"></div>
                  <span>Classroom</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-100 border border-gray-400 rounded"></div>
                  <span>Lab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-gray-400 rounded"></div>
                  <span>Office</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-gray-400 rounded"></div>
                  <span>Common</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-100 border border-gray-400 rounded"></div>
                  <span>Library</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-gray-400 rounded"></div>
                  <span>Theatre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
                  <span>Facilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>You are here</span>
                </div>
              </div>
            </div>
          </div>

          {/* Room Details Panel */}
          {selectedRoom && (
            <div className="w-80 bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedRoom.label}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRoom(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{floorData[currentFloor].title}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Capacity</span>
                  <span className="ml-auto font-medium">
                    {selectedRoom.type === 'classroom' ? '32 students' :
                     selectedRoom.type === 'lab' ? '25 students' :
                     selectedRoom.type === 'theatre' ? '100 students' :
                     selectedRoom.type === 'library' ? '50 students' : 'Varies'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Status</span>
                  <span className="ml-auto font-medium">Available</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Equipment</span>
                  <span className="ml-auto font-medium">
                    {selectedRoom.type === 'theatre' ? 'AV System, Projector' :
                     selectedRoom.type === 'lab' ? 'Lab Equipment, Computers' :
                     selectedRoom.type === 'library' ? 'Study Resources' :
                     'Projector, Smart Board'}
                  </span>
                </div>

                {selectedRoom.description && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{selectedRoom.description}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t text-xs text-gray-500">
                Click to navigate • ESC to close
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Campus25MultiFloorFixed;
