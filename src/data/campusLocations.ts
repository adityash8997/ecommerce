export interface CampusLocation {
  id: number;
  name: string;
  fullName: string;
  description: string;
  hasMap: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
}

export const campusLocations: CampusLocation[] = [
  {
    id: 1,
    name: "Campus 1",
    fullName: "KIIT Campus 1",
    description: "Explore Campus 1 facilities and detailed room layout.",
    hasMap: true,
    coordinates: { lat: 20.3547, lng: 85.8154 },
    address: "KIIT Road, Patia, Bhubaneswar, Odisha 751024"
  },
  {
    id: 2,
    name: "Campus 2",
    fullName: "KIIT Campus 2",
    description: "Explore Campus 2 facilities and detailed room layout.",
    hasMap: true,
    coordinates: { lat: 20.3560, lng: 85.8180 },
    address: "KIIT Road, Patia, Bhubaneswar, Odisha 751024"
  },
  {
    id: 3,
    name: "Campus 3",
    fullName: "KIIT Campus 3",
    description: "School of Civil Engineering",
    hasMap: true,
    coordinates: { lat: 20.353939789901084, lng: 85.81645791752388 },
    address: "KIIT Campus 3, Patia, Bhubaneswar, Odisha"
  },
  {
    id: 4,
    name: "Campus 4",
    fullName: "KIIT Campus 4",
    description: "Academic and hostel facilities near main gate.",
    hasMap: true,
    coordinates: { lat: 20.354242318773267, lng: 85.82033849787699 },
    address: "KIIT Campus 4, Prasanti Vihar Road, Bhubaneswar, Odisha"
  },
  {
    id: 5,
    name: "Campus 5",
    fullName: "KIIT Campus 5",
    description: "Main administrative campus close to KIIT Avenue.",
    hasMap: true,
    coordinates: { lat: 20.352894389377816, lng: 85.81434803410967 },
    address: "Campus 5, KIIT Avenue, Bhubaneswar, Odisha"
  },
  {
    id: 6,
    name: "Campus 6",
    fullName: "KIIT Campus 6",
    description: "Events hub and auditorium",
    hasMap: true,
    coordinates: { lat: 20.35361233507902, lng: 85.81930652432158 },
    address: "Campus 6, KIIT University, Bhubaneswar, Odisha"
  },
  {
    id: 7,
    name: "Campus 7",
    fullName: "KIIT Campus 7",
    description: "Major academic blocks with hostels.",
    hasMap: true,
    coordinates: { lat: 20.348418430144942, lng: 85.82098646109591 },
    address: "Campus 7, KIIT, Bhubaneswar, Odisha"
  },
  {
    id: 8,
    name: "Campus 8",
    fullName: "KIIT Campus 8",
    description: "School of Mechanical Engineering",
    hasMap: true,
    coordinates: { lat: 20.351473890489004, lng: 85.81886665424723 },
    address: "Campus 8, KIIT University, Bhubaneswar, Odisha"
  },
  {
    id: 9,
    name: "Campus 9",
    fullName: "KIIT Campus 9",
    description: "KIIT Boarding School",
    hasMap: true,
    coordinates: { lat: 20.35353832228164, lng: 85.81176547774591 },
    address: "Campus 9, KIIT University, Bhubaneswar, Odisha"
  },
  {
    id: 11,
    name: "Campus 11",
    fullName: "KIIT Campus 11",
    description: "School of Biotechnology and Chemical Engineering",
    hasMap: true,
    coordinates: { lat: 20.358419919088515, lng: 85.82226050233545 },
    address: "Campus 11, KIMS Hospital Road, Bhubaneswar, Odisha"
  },
  {
    id: 12,
    name: "Campus 12",
    fullName: "KIIT Campus 12",
    description: "School of Electronics Engineering",
    hasMap: true,
    coordinates: { lat: 20.355482975936745, lng: 85.82092615315062 },
    address: "Campus 12, KIIT University, Bhubaneswar, Odisha"
  },
  {
    id: 13,
    name: "Campus 13",
    fullName: "KIIT Campus 13",
    description: "KSAC and Sports Centre",
    hasMap: true,
    coordinates: { lat: 20.356880909020145, lng: 85.81881870342482 },
    address: "Campus 13, KIIT Bhubaneswar, Odisha"
  },
  {
    id: 14,
    name: "Campus 14",
    fullName: "KIIT Campus 14",
    description: "Polytechnic School",
    hasMap: true,
    coordinates: { lat: 20.35519832870198, lng: 85.81608000102723 },
    address: "Campus 14, KIIT University, Patia, Bhubaneswar"
  },
  {
    id: 15,
    name: "Campus 15",
    fullName: "KIIT Campus 15",
    description: "School of Computer Engineering",
    hasMap: true,
    coordinates: { lat: 20.34847987076732, lng: 85.81674426849297 },
    address: "Campus 15, KIIT Patia, Bhubaneswar"
  },
  {
    id: 16,
    name: "Campus 16",
    fullName: "KIIT Campus 16",
    description: "School of Law",
    hasMap: true,
    coordinates: { lat: 20.36219314946686, lng: 85.82326134760304 },
    address: "Campus 16, KIIT University, Bhubaneswar"
  },
  {
    id: 17,
    name: "Campus 17",
    fullName: "KIIT Campus 17",
    description: "School of Architecture",
    hasMap: true,
    coordinates: { lat: 20.349348762516648, lng: 85.82004911082174 },
    address: "Campus 17, KIIT University, Bhubaneswar, Odisha"
  },
  {
    id: 20,
    name: "Campus 20",
    fullName: "KIIT Campus 20",
    description: "Knowledge Tower",
    hasMap: true,
    coordinates: { lat: 20.35424037771815, lng: 85.81697934335601 },
    address: "Campus 20, KIIT University, Bhubaneswar, Odisha"
  },
  {
    id: 22,
    name: "Campus 22",
    fullName: "KIIT Campus 22",
    description: "KIIT R&D and Innovation Centre",
    hasMap: true,
    coordinates: { lat: 20.354407270345217, lng: 85.81531313965745 },
    address: "Campus 22, KIIT Road, Bhubaneswar, Odisha"
  },
  {
    id: 25,
    name: "Campus 25",
    fullName: "KIIT Campus 25",
    description: "School of Computer Engineering",
    hasMap: true,
    coordinates: { lat: 20.3494, lng: 85.8155 },
    address: "School of Agricultural Sciences, KIIT Campus 25, Bhubaneswar"
  }
];