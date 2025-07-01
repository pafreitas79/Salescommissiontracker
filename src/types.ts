export enum PaymentStatus {
    Paid = 'Paid',
    Unpaid = 'Unpaid',
}

export type RappelCalculationMethod = 'rolling' | 'ytd';

export interface Salesperson {
    id: string;
    name: string;
    email: string;
    baseCommissionRate: number; // in percentage
}

export interface Commission {
    id: string;
    salespersonId: string;
    revenue: number;
    dealId: string;
    commissionRate: number; // in percentage
    status: PaymentStatus;
    paymentDate?: string;
    isAdvance: boolean;
    entryDate: string;
    rappelBonus: number;
}

export interface RappelTier {
    id: string;
    threshold: number;
    bonusPercentage: number;
}

export interface SalesData extends Salesperson {
    totalRevenue: number;
    baseCommissions: number;
    rappelBonus: number;
    totalCommission: number;
    totalPaid: number;
    balance: number;
    commissionHistory: Commission[];
}

export interface ParsedCsvRow {
    salesperson_email: string;
    salesperson_name?: string;
    revenue: string;
    deal_id: string;
    entry_date: string; // YYYY-MM-DD
    status: string; // Paid or Unpaid
    payment_date?: string; // YYYY-MM-DD
}