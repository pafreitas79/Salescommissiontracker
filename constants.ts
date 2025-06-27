
import { Salesperson, Commission, RappelTier, PaymentStatus } from './types';

export const INITIAL_SALESPEOPLE: Salesperson[] = [
    { id: 'sp-1', name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 'sp-2', name: 'Bob Williams', email: 'bob@example.com' },
    { id: 'sp-3', name: 'Charlie Brown', email: 'charlie@example.com' },
];

export const INITIAL_COMMISSIONS: Commission[] = [
    { id: 'comm-1', salespersonId: 'sp-1', revenue: 5000, commissionRate: 30, status: PaymentStatus.Paid, paymentDate: '2023-10-15', isAdvance: false, entryDate: '2023-10-01' },
    { id: 'comm-2', salespersonId: 'sp-1', revenue: 7500, commissionRate: 30, status: PaymentStatus.Unpaid, isAdvance: false, entryDate: '2023-10-05' },
    { id: 'comm-3', salespersonId: 'sp-2', revenue: 12000, commissionRate: 30, status: PaymentStatus.Paid, paymentDate: '2023-10-20', isAdvance: true, entryDate: '2023-09-28' },
    { id: 'comm-4', salespersonId: 'sp-2', revenue: 8000, commissionRate: 30, status: PaymentStatus.Unpaid, isAdvance: false, entryDate: '2023-10-12' },
    { id: 'comm-5', salespersonId: 'sp-3', revenue: 25000, commissionRate: 30, status: PaymentStatus.Unpaid, isAdvance: false, entryDate: '2023-10-18' },
    { id: 'comm-6', salespersonId: 'sp-1', revenue: 15000, commissionRate: 30, status: PaymentStatus.Unpaid, isAdvance: false, entryDate: '2023-10-22' },
];

export const INITIAL_RAPPEL_TIERS: RappelTier[] = [
    { id: 'tier-1', threshold: 10000, bonusPercentage: 1 },
    { id: 'tier-2', threshold: 20000, bonusPercentage: 2 },
    { id: 'tier-3', threshold: 50000, bonusPercentage: 3 },
];
