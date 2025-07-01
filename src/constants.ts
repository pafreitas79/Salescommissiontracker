
import { Salesperson, Commission, RappelTier, PaymentStatus } from './types';

export const INITIAL_SALESPEOPLE: Salesperson[] = [];

export const INITIAL_COMMISSIONS: Commission[] = [];

export const INITIAL_RAPPEL_TIERS: RappelTier[] = [
    { id: 'tier-1', threshold: 10000, bonusPercentage: 1 },
    { id: 'tier-2', threshold: 20000, bonusPercentage: 2 },
    { id: 'tier-3', threshold: 50000, bonusPercentage: 3 },
];
