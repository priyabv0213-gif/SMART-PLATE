export interface SupportedLocation {
  id: string;
  name: string;
  state: string;
  displayName: string;
  lat: number;
  lng: number;
  zoom: number;
  isDemoHub?: boolean;
  popularLocalities?: string[];
  activeDonationsCount?: number;
}

export const SUPPORTED_INDIAN_LOCATIONS: SupportedLocation[] = [
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    displayName: 'Coimbatore, Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558,
    zoom: 13,
    isDemoHub: true,
    popularLocalities: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Singanallur', 'Ukkadam', 'Race Course', 'Saravanampatti'],
    activeDonationsCount: 6,
  },
  {
    id: 'tiruppur',
    name: 'Tiruppur',
    state: 'Tamil Nadu',
    displayName: 'Tiruppur, Tamil Nadu',
    lat: 11.1085,
    lng: 77.3411,
    zoom: 13,
    popularLocalities: ['Avinashi Road', 'Kumaran Road', 'Kangeyam Road', 'Uthukuli'],
    activeDonationsCount: 2,
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    displayName: 'Chennai, Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    zoom: 12,
    popularLocalities: ['T. Nagar', 'Mylapore', 'Anna Nagar', 'Adyar', 'Velachery', 'Guindy'],
    activeDonationsCount: 4,
  },
  {
    id: 'madurai',
    name: 'Madurai',
    state: 'Tamil Nadu',
    displayName: 'Madurai, Tamil Nadu',
    lat: 9.9252,
    lng: 78.1198,
    zoom: 13,
    popularLocalities: ['KK Nagar', 'Anna Nagar', 'Simmakkal', 'Goripalayam'],
    activeDonationsCount: 2,
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    displayName: 'Bengaluru, Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    zoom: 12,
    popularLocalities: ['Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'HSR Layout'],
    activeDonationsCount: 5,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    displayName: 'Hyderabad, Telangana',
    lat: 17.3850,
    lng: 78.4867,
    zoom: 12,
    popularLocalities: ['Banjara Hills', 'Gachibowli', 'Hitec City', 'Secunderabad', 'Madhapur'],
    activeDonationsCount: 3,
  },
  {
    id: 'kochi',
    name: 'Kochi',
    state: 'Kerala',
    displayName: 'Kochi, Kerala',
    lat: 9.9312,
    lng: 76.2673,
    zoom: 13,
    popularLocalities: ['Ernakulam', 'Fort Kochi', 'Kakkanad', 'Edappally', 'Marine Drive'],
    activeDonationsCount: 2,
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    displayName: 'Mumbai, Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    zoom: 12,
    popularLocalities: ['Bandra West', 'Andheri East', 'Colaba', 'Dadar', 'Powai', 'Kurla'],
    activeDonationsCount: 4,
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    displayName: 'Pune, Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    zoom: 12,
    popularLocalities: ['Kothrud', 'Viman Nagar', 'Hinjewadi', 'Koregaon Park', 'Baner'],
    activeDonationsCount: 2,
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi',
    displayName: 'Delhi NCR',
    lat: 28.6139,
    lng: 77.2090,
    zoom: 11,
    popularLocalities: ['Connaught Place', 'Karol Bagh', 'Hauz Khas', 'Noida', 'Gurugram', 'Saket'],
    activeDonationsCount: 3,
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    displayName: 'Kolkata, West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    zoom: 12,
    popularLocalities: ['Park Street', 'Salt Lake', 'New Town', 'Ballygunge', 'Howrah'],
    activeDonationsCount: 2,
  },
];

export const ALL_INDIA_OPTION: SupportedLocation = {
  id: 'all_india',
  name: 'All India',
  state: 'India',
  displayName: 'All India (Nationwide Overview)',
  lat: 20.5937,
  lng: 78.9629,
  zoom: 5,
  popularLocalities: ['Pan-India Network', 'All Municipal Zones'],
};

export const DEFAULT_LOCATION = SUPPORTED_INDIAN_LOCATIONS[0]; // Coimbatore

export function findLocationById(id: string): SupportedLocation {
  if (id === 'all_india') return ALL_INDIA_OPTION;
  return SUPPORTED_INDIAN_LOCATIONS.find((loc) => loc.id === id || loc.displayName.toLowerCase().includes(id.toLowerCase())) || DEFAULT_LOCATION;
}

export function searchLocations(query: string): SupportedLocation[] {
  if (!query.trim()) return SUPPORTED_INDIAN_LOCATIONS;
  const q = query.toLowerCase();
  return SUPPORTED_INDIAN_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      loc.displayName.toLowerCase().includes(q) ||
      loc.popularLocalities?.some((locality) => locality.toLowerCase().includes(q))
  );
}
