// Fixpass technician roster — single source of truth for the
// admin's "assign" picker and for the member-facing "Marco is your
// technician" affordance.
//
// Kept in code (not the DB) on purpose for v1: the bench is one
// person (Nicolas) and the operator console only needs to record
// "who's coming" alongside a scheduled visit. When the bench grows
// beyond ~3 people, this graduates to a `technicians` table and
// availability records — at which point this file becomes a
// fallback / type definition.

export type Technician = {
  id: string;
  name: string;
  phone?: string;
  // Internal note shown only on the admin side (e.g. "Drywall +
  // hardware specialist; serves north of I-10").
  internalNote?: string;
};

export const TECHNICIANS: readonly Technician[] = [
  {
    id: "nicolas",
    name: "Nicolas",
  },
];

export function findTechnician(id: string | null | undefined): Technician | undefined {
  if (!id) return undefined;
  return TECHNICIANS.find((t) => t.id === id);
}

export function defaultTechnician(): Technician {
  return TECHNICIANS[0];
}
