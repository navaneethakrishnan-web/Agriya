import type { GovScheme } from '@/types';

export const GOV_SCHEMES: GovScheme[] = [
  {
    id: 's1',
    name: 'PM-KISAN',
    description: 'Direct income support of ₹6,000/year in three instalments to eligible farmer families.',
    state: 'All India',
    category: 'Income Support',
    eligibility: 'Small and marginal landholding farmer families',
    benefit: '₹6,000 per year',
    deadline: 'Rolling — apply anytime',
  },
  {
    id: 's2',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    description: 'Crop insurance covering yield loss from natural calamities, pests, and diseases.',
    state: 'All India',
    category: 'Insurance',
    eligibility: 'All farmers growing notified crops',
    benefit: 'Low-premium insurance cover',
    deadline: 'Before Kharif/Rabi sowing cut-off',
  },
  {
    id: 's3',
    name: 'Kisan Credit Card',
    description: 'Short-term credit for crop production and allied activities at subsidised interest.',
    state: 'All India',
    category: 'Credit',
    eligibility: 'Farmers, tenant farmers, sharecroppers',
    benefit: 'Loans up to ₹3 lakh at 4% effective interest',
  },
  {
    id: 's4',
    name: 'Soil Health Card Scheme',
    description: 'Free soil testing and nutrient recommendations every 2 years.',
    state: 'All India',
    category: 'Advisory',
    eligibility: 'All farmers',
    benefit: 'Free soil test + fertilizer recommendation',
  },
  {
    id: 's5',
    name: 'Per Drop More Crop (Micro Irrigation)',
    description: 'Subsidy for drip and sprinkler irrigation systems.',
    state: 'All India',
    category: 'Irrigation',
    eligibility: 'Farmers installing approved micro-irrigation systems',
    benefit: '45-55% subsidy on equipment cost',
  },
  {
    id: 's6',
    name: 'Tamil Nadu Farm Mechanization Scheme',
    description: 'Subsidy on tractors, tillers, and harvesters for small farmers in Tamil Nadu.',
    state: 'Tamil Nadu',
    category: 'Equipment',
    eligibility: 'Small/marginal farmers in Tamil Nadu',
    benefit: 'Up to 50% subsidy on farm equipment',
  },
  {
    id: 's7',
    name: 'Rashtriya Krishi Vikas Yojana',
    description: 'State-driven scheme for agriculture and allied sector infrastructure investment.',
    state: 'All India',
    category: 'Infrastructure',
    eligibility: 'State-selected farmer groups & FPOs',
    benefit: 'Varies by state project',
  },
  {
    id: 's8',
    name: 'Paramparagat Krishi Vikas Yojana',
    description: 'Cluster-based support for farmers transitioning to organic farming.',
    state: 'All India',
    category: 'Organic Farming',
    eligibility: 'Farmer groups of 50+ acres forming a cluster',
    benefit: '₹31,000/hectare over 3 years',
  },
];

export function filterSchemes(
  schemes: GovScheme[],
  { search, state, category }: { search?: string; state?: string; category?: string }
) {
  return schemes.filter((s) => {
    if (search && !`${s.name} ${s.description}`.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (state && state !== 'All' && s.state !== state && s.state !== 'All India') return false;
    if (category && category !== 'All' && s.category !== category) return false;
    return true;
  });
}
