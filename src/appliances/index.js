import { Washer } from "./washer.js";
import { Dryer } from "./dryer.js";

// Register new kinds of appliance here.
export const APPLIANCES = { washer: Washer, dryer: Dryer };

export function createAppliance(type) {
  const Cls = APPLIANCES[type] || Washer;
  return new Cls();
}
