// Marketing copy + plan data used across marketing pages.
// Keeping it centralized so voice tweaks happen in one place.

export const plans = [
  {
    id: "silver" as const,
    name: "Silver",
    tagline: "Lighter upkeep. Peace of mind month-to-month.",
    monthlyPrice: 24.99,
    annualPrice: 249.99,
    includedVisits: 2,
    maxRelatedTasks: 3,
    maxLaborMinutes: 90,
    priority: "Standard",
    outOfScopeDiscount: 5,
    materialsAllowance: 0,
    fairUseNotes: null,
    featured: null as null | string,
  },
  {
    id: "gold" as const,
    name: "Gold",
    tagline: "The core Fixpass plan for active households.",
    monthlyPrice: 49.99,
    annualPrice: 499.99,
    includedVisits: 5,
    maxRelatedTasks: 3,
    maxLaborMinutes: 90,
    priority: "Priority",
    outOfScopeDiscount: 10,
    materialsAllowance: 0,
    fairUseNotes: null,
    featured: "Best value",
  },
  {
    id: "platinum" as const,
    name: "Platinum",
    tagline: "Highest priority, fair-use guardrails, materials covered.",
    monthlyPrice: 99.99,
    annualPrice: 999.99,
    includedVisits: "Unlimited",
    maxRelatedTasks: 3,
    maxLaborMinutes: 90,
    priority: "Fastest",
    outOfScopeDiscount: 15,
    materialsAllowance: 40,
    fairUseNotes: "Fair-use applies — keeps coverage affordable for everyone.",
    featured: "Most complete",
  },
];

export const serviceInventory = [
  { title: "TV & shelf mounting",       copy: "Brackets, anchors, level-checked installs." },
  { title: "Art, mirrors & decor",      copy: "Gallery hangs and large-mirror placements." },
  { title: "Furniture assembly",        copy: "From flat-pack dressers to bed frames." },
  { title: "Door hardware",             copy: "Sticking doors, loose handles, soft-close fixes." },
  { title: "Drywall & paint touch-up",  copy: "Anchor holes, scuffs, nail pops — gone." },
  { title: "Light fixtures & switches", copy: "Swap fixtures, replace plates and dimmers." },
  { title: "Curtains & blinds",         copy: "Measure, mount, align — rooms feel finished." },
  { title: "Smart-home setup",          copy: "Doorbells, sensors, thermostats configured right." },
];

export const excludedServices = [
  "Major remodels and rough-framing",
  "Licensed electrical panel / new circuit work",
  "Licensed plumbing (main line, re-pipe, water heater install)",
  "Roofing, foundation, tree removal",
  "HVAC compressor / refrigerant work",
  "Appliance repair under manufacturer warranty",
];

export const defaultRules = [
  "One registered property per membership — keeps coverage scoped.",
  "Covered visits target 1–3 business days depending on plan.",
  "Every request gets reviewed by an operator before scheduling.",
  "Excluded or oversized work may be quoted separately.",
];

export const faqs = [
  {
    q: "What counts as a covered fix?",
    a: "Small-to-medium handyman work completed in a single visit — fixture swaps, mounting, drywall patching, minor repairs. Up to 3 related tasks or one moderately-sized job per visit, within a 90-minute labor cap.",
  },
  {
    q: "Are materials included?",
    a: "Platinum includes $40 / month materials allowance. Silver and Gold pass through materials at cost or quote them separately.",
  },
  {
    q: "How fast can someone come out?",
    a: "Most requests are scheduled within 1–3 business days depending on your plan tier. Operators triage every request and confirm the window with you.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — Fixpass is month-to-month. Cancel before your next billing cycle and your membership ends at the next renewal.",
  },
  {
    q: "What if I need a bigger project?",
    a: "We'll quote it separately with your member discount (5–15% off depending on tier). For trades that require a license, we may refer you to a partner and help coordinate.",
  },
  {
    q: "Which areas are covered?",
    a: "Fixpass is currently serving Katy, TX. New service areas get added as we add operators to support them.",
  },
];

export const testimonials = [
  {
    quote:
      "Fixpass saved me hours every month. I stopped chasing random contractors and finally have reliable help on demand.",
    name: "Alicia R.",
    role: "Homeowner, Katy",
  },
  {
    quote:
      "As a landlord, predictable monthly maintenance is a game changer. Response times are fast and communication is excellent.",
    name: "Marcus T.",
    role: "Property owner",
  },
  {
    quote: "It feels like having a trusted handyman team in my back pocket. Super smooth experience.",
    name: "Janelle K.",
    role: "Busy professional",
  },
];
