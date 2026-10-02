import type { RagSource } from '@/types';

/**
 * RAG_DOCUMENTS / KNOWLEDGE_BASE placeholder
 * ------------------------------------------
 * In production this array is replaced by documents uploaded via the Admin
 * → Knowledge Base screen (PDFs, government circulars, crop manuals, soil
 * and weather reports). Each document should be chunked and embedded
 * (e.g. with a Cloud Function calling an embeddings model) and stored in a
 * vector index — Firestore Vector Search, Pinecone, or Weaviate all work.
 *
 * This in-memory list exists so the chatbot has *something real and
 * agriculture-specific* to retrieve from out of the box, and so the
 * retrieval interface (`retrieveContext`) has a stable contract to build
 * against before a real vector DB is wired up.
 */
export interface KnowledgeDoc {
  id: string;
  title: string;
  type: RagSource['type'];
  keywords: string[];
  content: string;
}

export const KNOWLEDGE_BASE: KnowledgeDoc[] = [
  {
    id: 'doc-pmfby',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) — Overview',
    type: 'Government Document',
    keywords: ['insurance', 'crop insurance', 'pmfby', 'premium', 'claim', 'loss', 'compensation'],
    content:
      'PMFBY provides crop insurance against yield loss due to natural calamities, pests, and diseases. Farmers pay a low premium (2% for Kharif, 1.5% for Rabi, 5% for commercial/horticulture crops) and the rest is subsidised by Central and State governments. Claims are settled based on Crop Cutting Experiments (CCE) data and can be tracked on the PMFBY portal or through your local bank/CSC.',
  },
  {
    id: 'doc-soil-health',
    title: 'Soil Health Card Scheme — Nutrient Management',
    type: 'Soil Report',
    keywords: ['soil', 'nitrogen', 'phosphorus', 'potassium', 'ph', 'fertility', 'nutrient', 'soil health card'],
    content:
      'Soil Health Cards report N-P-K levels, pH, organic carbon, and micronutrients for a farm plot, issued every 2 years. Ideal soil pH for most crops is 6.0–7.5. If nitrogen is low, apply urea in split doses at sowing, tillering, and panicle stages rather than one large dose, to reduce leaching and improve uptake.',
  },
  {
    id: 'doc-rice-blast',
    title: 'Crop Manual: Rice Blast (Magnaporthe oryzae) Management',
    type: 'Crop Manual',
    keywords: ['rice', 'paddy', 'blast', 'fungus', 'disease', 'leaf spots', 'neck blast'],
    content:
      'Rice blast appears as spindle-shaped grey-centred lesions on leaves and can girdle the neck node, causing panicles to fall over ("neck blast"). Management: use resistant varieties, avoid excess nitrogen, ensure good field drainage, and apply tricyclazole or a recommended systemic fungicide at first symptom, repeating after 10–15 days if humidity remains high.',
  },
  {
    id: 'doc-wheat-rust',
    title: 'Crop Manual: Wheat Yellow Rust',
    type: 'Crop Manual',
    keywords: ['wheat', 'rust', 'yellow rust', 'stripe rust', 'fungicide'],
    content:
      'Yellow rust shows as yellow-orange powdery stripes along leaf veins, thriving in cool humid weather (10–15°C). Scout fields weekly from tillering onward. Spray propiconazole-based fungicide at first sign, and prefer rust-resistant wheat varieties recommended for your agro-climatic zone in future sowings.',
  },
  {
    id: 'doc-drip-irrigation',
    title: 'Per Drop More Crop — Micro Irrigation Subsidy',
    type: 'Government Document',
    keywords: ['irrigation', 'drip', 'sprinkler', 'water', 'subsidy', 'micro irrigation'],
    content:
      'The Per Drop More Crop component subsidises drip and sprinkler irrigation equipment, typically 55% for small/marginal farmers and 45% for others, varying by state. Drip irrigation can cut water use by 30-50% versus flood irrigation while improving yield for row crops like cotton, sugarcane, and vegetables.',
  },
  {
    id: 'doc-organic-certification',
    title: 'PGS-India Organic Certification Process',
    type: 'Government Document',
    keywords: ['organic', 'certification', 'pgs-india', 'natural farming'],
    content:
      'PGS-India (Participatory Guarantee System) lets farmer groups certify each other as organic through peer review at lower cost than third-party certification. Conversion period is generally 2 years for annual crops before produce can be labelled fully organic. Group formation happens through the Regional Council under MOVCDNER or PKVY schemes.',
  },
  {
    id: 'doc-monsoon-advisory',
    title: 'Kharif Sowing Weather Advisory',
    type: 'Weather Report',
    keywords: ['monsoon', 'kharif', 'sowing', 'rain', 'rainfall', 'weather'],
    content:
      'Sow Kharif crops after receiving at least 75–100mm of cumulative rainfall to ensure adequate soil moisture at germination depth. Delaying sowing beyond 2–3 weeks after monsoon onset in your zone typically reduces yield potential; short-duration varieties are advisable if the monsoon is delayed.',
  },
  {
    id: 'doc-pest-aphid',
    title: 'Integrated Pest Management: Aphids',
    type: 'Crop Manual',
    keywords: ['aphid', 'pest', 'sucking pest', 'ipm', 'neem'],
    content:
      'Aphids cluster on new growth and undersides of leaves, causing curling and honeydew/sooty mould. Use yellow sticky traps for monitoring, encourage ladybird beetle predators, and spray neem oil (1500 ppm) as a first line before resorting to imidacloprid-based insecticides, only if infestation crosses economic threshold levels.',
  },
  {
    id: 'doc-kcc',
    title: 'Kisan Credit Card (KCC) Scheme',
    type: 'Government Document',
    keywords: ['loan', 'credit', 'kcc', 'kisan credit card', 'interest subvention'],
    content:
      'KCC provides short-term crop loans up to ₹3 lakh at 7% interest, reduced to an effective 4% for farmers who repay on time under the interest subvention scheme. Apply through any nationalised bank or cooperative society with land records and Aadhaar; the card also covers post-harvest and allied activities like dairy and fisheries.',
  },
  {
    id: 'doc-storage',
    title: 'Post-Harvest Storage Best Practices',
    type: 'Crop Manual',
    keywords: ['storage', 'godown', 'post-harvest', 'grain storage', 'warehouse receipt'],
    content:
      'Store grain at below 12% moisture content in clean, dry, pest-free structures; use hermetic bags or metal bins for small quantities to prevent weevil infestation without chemical fumigants. Warehouse Receipt financing lets farmers store produce in accredited warehouses and borrow against the receipt instead of distress-selling at harvest.',
  },
];

export function keywordRetrieve(query: string, topK = 3) {
  const q = query.toLowerCase();
  const scored = KNOWLEDGE_BASE.map((doc) => {
    let score = 0;
    for (const kw of doc.keywords) {
      if (q.includes(kw.toLowerCase())) score += 2;
    }
    // light token overlap fallback
    const queryTokens = new Set(q.split(/\W+/).filter(Boolean));
    const contentTokens = new Set(
      (doc.title + ' ' + doc.content).toLowerCase().split(/\W+/).filter(Boolean)
    );
    for (const t of queryTokens) {
      if (t.length > 3 && contentTokens.has(t)) score += 0.5;
    }
    return { doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK).filter((s) => s.score > 0);
  const maxPossible = 6; // rough normaliser for confidence display
  const confidence = top.length
    ? Math.min(1, top[0].score / maxPossible)
    : 0;

  return { results: top, confidence };
}
