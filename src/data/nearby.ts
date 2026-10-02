import type { NearbyFacility } from '@/types';

const NAMES: Record<NearbyFacility['type'], string[]> = {
  'Krishi Kendra': ['Krishi Vigyan Kendra', 'Block Krishi Kendra'],
  'Agriculture Office': ['District Agriculture Office', 'Taluk Agriculture Office'],
  'Fertilizer Shop': ['IFFCO Bazaar', 'Kisan Fertilizer Depot'],
  'Seed Shop': ['TN Seed Corporation Outlet', 'National Seeds Corporation'],
  'Soil Testing Lab': ['Govt Soil Testing Laboratory', 'Mobile Soil Testing Van'],
};

// Deterministic pseudo-placement around the user's coordinates — a stand-in
// until real facility data (e.g. from a government open-data API or a
// curated Firestore collection) is wired in.
export function nearbyFacilities(lat: number, lng: number): NearbyFacility[] {
  const types = Object.keys(NAMES) as NearbyFacility['type'][];
  const facilities: NearbyFacility[] = [];
  let seed = 1;

  types.forEach((type, ti) => {
    NAMES[type].forEach((name, ni) => {
      seed += 1;
      const angle = (seed * 47) % 360;
      const distanceKm = 1.2 + ((ti + ni) % 4) * 1.6;
      const rad = (angle * Math.PI) / 180;
      const dLat = (distanceKm / 111) * Math.cos(rad);
      const dLng = (distanceKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(rad);
      facilities.push({
        id: `${type}-${ni}`,
        name,
        type,
        lat: lat + dLat,
        lng: lng + dLng,
        distanceKm: Math.round(distanceKm * 10) / 10,
        address: `Near ${name}, local block`,
      });
    });
  });

  return facilities.sort((a, b) => a.distanceKm - b.distanceKm);
}
