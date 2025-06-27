
export enum PaymentStatus {
    Paid = 'Paid',
    Unpaid = 'Unpaid',
}

export interface Salesperson {
    id: string;
    name: string;
    email: string;
}

export interface Commission {
    id: string;
    salespersonId: string;
    revenue: number;
    commissionRate: number; // in percentage
    status: PaymentStatus;
    paymentDate?: string;
    isAdvance: boolean;
    entryDate: string;
}

export interface RappelTier {
    id: string;
    threshold: number;
    bonusPercentage: number;
}

export interface SalesData extends Salesperson {
    totalRevenue: number;
    revenueLast12Months: number;
    baseCommissions: number;
    rappelBonus: number;
    totalCommission: number;
    totalPaid: number;
    balance: number;
    commissionHistory: Commission[];
}
