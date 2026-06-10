// Marketing copy + plan data used across marketing pages.
// Keeping it centralized so voice tweaks happen in one place.

// Billing model: 3-month, 6-month, or 1-year prepaid cycles.
// Longer cycle = better per-month effective rate.

export type BillingCycleId = "3mo" | "6mo" | "1yr";

export const billingCycles: Array<{
  id: BillingCycleId;
  months: number;
  label: string;
  short: string;
  badge?: string;
}> = [
  { id: "3mo", months: 3, label: "3 months", short: "3 mo" },
  { id: "6mo", months: 6, label: "6 months", short: "6 mo", badge: "Most popular" },
  { id: "1yr", months: 12, label: "1 year", short: "1 yr", badge: "Best value" },
];

export const DEFAULT_BILLING_CYCLE: BillingCycleId = "1yr";

export type PlanId = "silver" | "gold" | "platinum";

export type PlanPrices = Record<BillingCycleId, number>;

export const plans: Array<{
  id: PlanId;
  name: string;
  tagline: string;
  prices: PlanPrices;
  includedVisits: number | string;
  maxRelatedTasks: number;
  maxLaborMinutes: number;
  priority: string;
  outOfScopeDiscount: number;
  materialsAllowance: number;
  fairUseNotes: string | null;
  featured: string | null;
}> = [
  {
    id: "silver",
    name: "Silver",
    tagline: "Lighter upkeep. Peace of mind on your terms.",
    prices: { "3mo": 74.99, "6mo": 124.99, "1yr": 244.99 },
    includedVisits: 1,
    maxRelatedTasks: 3,
    maxLaborMinutes: 90,
    priority: "Standard",
    outOfScopeDiscount: 5,
    materialsAllowance: 0,
    fairUseNotes: null,
    featured: null,
  },
  {
    id: "gold",
    name: "Gold",
    tagline: "The core Fixpass plan for active households.",
    prices: { "3mo": 149.99, "6mo": 273.99, "1yr": 503.99 },
    includedVisits: 3,
    maxRelatedTasks: 3,
    maxLaborMinutes: 90,
    priority: "Priority",
    outOfScopeDiscount: 10,
    materialsAllowance: 0,
    fairUseNotes: null,
    featured: null,
  },
  {
    id: "platinum",
    name: "Platinum",
    tagline: "Highest priority, the widest coverage, materials included.",
    prices: { "3mo": 299.99, "6mo": 519.99, "1yr": 949.99 },
    includedVisits: 5,
    maxRelatedTasks: 3,
    maxLaborMinutes: 90,
    priority: "Fastest",
    outOfScopeDiscount: 15,
    materialsAllowance: 40,
    fairUseNotes: null,
    featured: "Most complete",
  },
];

// Helpers consumed by UI + schema + checkout.
export function cycleMonths(cycle: BillingCycleId): number {
  return billingCycles.find((c) => c.id === cycle)?.months ?? 1;
}

export function planPrice(plan: { prices: PlanPrices }, cycle: BillingCycleId): number {
  return plan.prices[cycle];
}

export function planPerMonth(plan: { prices: PlanPrices }, cycle: BillingCycleId): number {
  return plan.prices[cycle] / cycleMonths(cycle);
}

// Covered services unlock cumulatively by tier: each plan covers
// everything the tiers below it cover, plus the services listed for it
// here. The order of `tierOrder` IS the inheritance chain. Outdoor work
// not listed here (fence painting, exterior touch-ups) is offered to
// members but quoted separately — see `/coverage` and FAQ.
export type CoveredService = {
  title: string;
  copy: string;
  // Optional sub-items shown as a nested list (e.g. furniture types).
  sub?: string[];
};

export const tierOrder: PlanId[] = ["silver", "gold", "platinum"];

export const tierServices: Record<PlanId, CoveredService[]> = {
  silver: [
    { title: "Door adjustments",            copy: "Sticking or misaligned interior doors planed, shimmed, and rehung true." },
    { title: "Small drywall patches",       copy: "Anchor holes, nail pops, and dings filled, sanded, and feathered flush." },
    { title: "Handle installation",         copy: "Interior door handles and lever sets fitted, aligned, and tightened." },
    { title: "Shelf installation",          copy: "Floating shelves and brackets anchored into stud and level-checked." },
    { title: "Mirror installation",         copy: "Wall mirrors hung secure and plumb, hardware kept out of sight." },
    { title: "Picture & frame installation", copy: "A single frame or a full gallery wall, spaced and leveled." },
    { title: "Paint touch-ups",             copy: "Scuffs and patched spots on small areas blended into the wall." },
    { title: "TV mounting",                 copy: "Brackets, anchors, cable management, level-checked." },
  ],
  gold: [
    { title: "Curtain installation",        copy: "Rods and tracks measured, mounted, and aligned to the window." },
    { title: "Knob replacement",            copy: "Cabinet and drawer knobs swapped, drilled, and aligned cleanly." },
    { title: "Cabinet door adjustments",    copy: "Hinges tuned so doors sit even and close soft." },
    { title: "Bathroom accessory installation", copy: "Towel bars, hooks, and holders anchored into tile or stud." },
    { title: "Caulking touch-ups",          copy: "Tub, sink, and counter lines re-sealed clean and watertight." },
    {
      title: "Furniture assembly",
      copy: "Flat-pack pieces built solid and squared up.",
      sub: ["Beds", "TV consoles", "Armoires", "Small cabinets"],
    },
  ],
  platinum: [
    { title: "Closet repair",               copy: "Shelves, rods, and organizer systems re-secured and re-leveled." },
    { title: "Driveway pressure washing",   copy: "Concrete and pavers washed back to clean." },
  ],
};

// Cumulative covered-service list for a plan (its own tier + all below).
export function coveredServicesFor(planId: PlanId): CoveredService[] {
  const upto = tierOrder.slice(0, tierOrder.indexOf(planId) + 1);
  return upto.flatMap((id) => tierServices[id]);
}

// The tier a given service first unlocks at (by title).
export function serviceTier(title: string): PlanId {
  return tierOrder.find((id) => tierServices[id].some((s) => s.title === title)) ?? "silver";
}

// Fully-resolved catalog — every covered service, in tier order. Used by
// the request-form chips, JSON-LD, and any "everything we cover" listing.
export const serviceInventory: CoveredService[] = coveredServicesFor("platinum");

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
    a: "Small-to-medium work completed in a single visit, with more services unlocking as you move up tiers. Silver covers the essentials — door adjustments, small drywall patches, handle, shelf, mirror, and picture/frame installation, small-area paint touch-ups, and TV mounting. Gold adds curtain installation, knob replacement, cabinet door adjustments, bathroom accessory installation, caulking touch-ups, and furniture assembly (beds, TV consoles, armoires, small cabinets). Platinum adds closet repair and driveway pressure washing. Every plan allows up to 3 related tasks or one moderately sized job per visit, within a 90-minute labor cap.",
  },
  {
    q: "What's NOT covered?",
    a: "Anything that requires a licensed trade (new electrical circuits, plumbing re-pipes, water heater installs), major remodels, rough-framing, roofing, foundation work, tree removal, HVAC refrigerant work, or appliance repair under manufacturer warranty. Outdoor work like fence painting and exterior touch-ups is offered to members but quoted separately rather than counted against a covered visit. Driveway pressure washing is included on Platinum. We'll quote licensed-trade work with your member discount or refer a partner.",
  },
  {
    q: "Are materials included?",
    a: "Platinum includes a $40 / month materials allowance. Silver and Gold pass materials through at cost, or we quote materials separately with your member discount applied. Member discount is 5–15% depending on tier.",
  },
  {
    q: "How fast can someone come out?",
    a: "Most requests are scheduled within 1–3 business days depending on plan tier. Gold + Platinum get priority dispatch. We triage every request inside 24 hours and confirm the window with you before a tech is dispatched.",
  },
  {
    q: "What if nobody's home?",
    a: "Tell us access arrangements in your request (gate code, lockbox, garage code, or \"I'll be home\"). Most members leave a specific access note on their property profile so they don't have to repeat it every time. If the tech arrives and can't access the home, the visit counts and we'll reschedule.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel anytime from the Stripe billing portal and your membership continues through the end of the current prepaid term, then stops renewing. No cancellation fees. Within the first 30 days of a fresh term you can request a prorated refund by emailing hello@getfixpass.com.",
  },
  {
    q: "What if Fixpass messes up my home?",
    a: "All technicians carry liability insurance through Fixpass. If a covered visit causes damage, file a claim to hello@getfixpass.com within 7 days of the visit and we'll route it through our insurer. We've also got a 30-day workmanship warranty — if something we fixed breaks again for the same reason, we come back inside your covered-visit envelope at no extra charge.",
  },
  {
    q: "Do you do emergency calls?",
    a: "No. If you have a gas leak, active flooding, or an electrical hazard, call 911 or your utility's emergency line. Fixpass operates on a scheduled, triaged model — that's the trade-off for predictable pricing and vetted technicians.",
  },
  {
    q: "Can I have Fixpass at more than one property?",
    a: "Each membership covers one registered property. If you own multiple homes (second home, rental, parents' place), each one needs its own membership. Bundle pricing is in the works — email hello@getfixpass.com if you have 2+ and want to discuss.",
  },
  {
    q: "How do pets + kids fit in?",
    a: "No issue — just flag them in your access notes so technicians aren't surprised. We ask techs to wear shoe covers in homes with kids or allergies, and we schedule around nap windows when requested.",
  },
  {
    q: "What's the typical cost vs hiring directly?",
    a: "A single handyman call-out in Katy runs $95–$140/hr with a 1-hour minimum, so a typical visit costs $125–$200. Gold works out to $42/mo on a 1-year prepaid term and covers 3 visits a month, which penciled against paying directly saves members $500–$1,500/year depending on usage.",
  },
  {
    q: "Which areas are covered?",
    a: "Fixpass is currently serving Katy, TX and nearby zip codes. Expanding to Cypress, Fulshear, Richmond, and Sugar Land next. If you're just outside our footprint and want to join a waitlist, email hello@getfixpass.com.",
  },
  {
    q: "Is Fixpass a handyman marketplace?",
    a: "No — the opposite. We don't list third-party handymen or let strangers bid on your home. Fixpass employs or directly contracts a small, vetted bench of technicians. Every request goes through an operator-reviewed triage before dispatch. It's slower than a marketplace but reliably the same quality.",
  },
  {
    q: "How is billing handled?",
    a: "End-to-end on Stripe. Card numbers never touch Fixpass — we just see the token. You can update cards, cancel, download invoices, or switch billing cycles from the Stripe-powered billing portal linked in your account.",
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
      "As a landlord, predictable maintenance on a prepaid plan takes a real weight off. Response times are fast and communication is excellent.",
    name: "Marcus T.",
    role: "Property owner",
  },
  {
    quote: "It feels like having a trusted handyman team in my back pocket. Super smooth experience.",
    name: "Janelle K.",
    role: "Busy professional",
  },
];
