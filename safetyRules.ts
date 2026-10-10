import { SafetyRule } from '../types';

export const STANDARD_SAFETY_RULES: SafetyRule[] = [
  {
    id: 'FDA-TPHC-HOT-4H',
    name: 'FDA Food Code 3-501.19 (Hot TCS Food - 4H Window)',
    standardAuthority: 'US FDA Food Code 2022 § 3-501.19',
    maxSafeHoursFromPrep: 4,
    requiresColdChain: false,
    requiresThermalBag: true,
    minTempHoldingC: 57,
    allowHumanRedistribution: true,
    description:
      'Time as Public Health Control for hot prepared meals. Food must be marked with a 4-hour window from the moment it leaves temperature control (>= 57°C) and consumed or discarded within this limit.',
  },
  {
    id: 'FDA-TPHC-COLD-6H',
    name: 'FDA Food Code 3-501.19 (Cold TCS Food - 6H Window)',
    standardAuthority: 'US FDA Food Code 2022 § 3-501.19',
    maxSafeHoursFromPrep: 6,
    requiresColdChain: true,
    requiresThermalBag: true,
    maxTempHoldingC: 5,
    allowHumanRedistribution: true,
    description:
      'Cold Time/Temperature Control for Safety (TCS) items (dairy, salads, chilled desserts). Must not exceed 21°C during transit and must be consumed within 6 hours.',
  },
  {
    id: 'FSSAI-SURPLUS-COOKED',
    name: 'FSSAI Surplus Food Regulations (Cooked & Prepared)',
    standardAuthority: 'FSSAI Food Safety & Standards Regulations 2019',
    maxSafeHoursFromPrep: 4.5,
    requiresColdChain: false,
    requiresThermalBag: true,
    minTempHoldingC: 60,
    allowHumanRedistribution: true,
    description:
      'Indian National Guidelines for cooked surplus food donation. Requires organoleptic sensory testing, clean food grade containers, insulated dispatch, and verified distribution log.',
  },
  {
    id: 'EU-HYGIENE-BAKERY-24H',
    name: 'EU Reg 852/2004 - Ambient Baked Goods (24H Safety Window)',
    standardAuthority: 'EU Regulation (EC) No 852/2004 on Hygiene of Foodstuffs',
    maxSafeHoursFromPrep: 24,
    requiresColdChain: false,
    requiresThermalBag: false,
    allowHumanRedistribution: true,
    description:
      'Ambient stable baked goods without fresh cream or custard fillings (bread, buns, dry pastries). Protected from physical contamination and humidity.',
  },
  {
    id: 'PRODUCE-FRESH-48H',
    name: 'USDA Fresh Produce Quality & Safety Guideline (48H)',
    standardAuthority: 'USDA AMS GAP & Food Recovery Network',
    maxSafeHoursFromPrep: 48,
    requiresColdChain: false,
    requiresThermalBag: false,
    allowHumanRedistribution: true,
    description:
      'Uncut fresh fruits and vegetables. Inspected for rot, pests, and mold. Stored in well-ventilated dry conditions.',
  },
  {
    id: 'PACKAGED-DRY-STABLE',
    name: 'Shelf-Stable Packaged Food & Canned Goods Standard',
    standardAuthority: 'Codex Alimentarius Stan 1-1985 / FDA Title 21',
    maxSafeHoursFromPrep: 168, // 7 days demo window
    requiresColdChain: false,
    requiresThermalBag: false,
    allowHumanRedistribution: true,
    description:
      'Commercial canned, boxed, or dry goods before manufacturer expiration. Intact seals, no dents, rust, or swelling.',
  },
];
