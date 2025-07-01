import React, { useState, useMemo } from 'react';
import { Commission, Salesperson, PaymentStatus } from '../types';
import { Card } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Modal from './ui/Modal';
import { Icon } from './ui/Icon';
import { generateReceiptPdf } from '../utils/pdfGenerator';

interface CommissionsProps {
    commissions: Commission[];
    salespeople: Salesperson[];
    onAddCommission: (commission: Omit<Commission, 'id' | 'rappelBonus'>) => void;
    onUpdateCommission: (commission: Commission) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);


const CommissionForm: React.FC<{ salespeople: Salesperson[]; onAdd: (data: any) => void; onClose: () => void }> = ({ salespeople, onAdd, onClose }) => {
    const [formData, setFormData] = useState({
        salespersonId: '',
        revenue: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const selectedSalespersonRate = useMemo(() => {
        if (!formData.salespersonId) return null;
        const selected = salespeople.find(sp => sp.id === formData.salespersonId);
        return selected ? selected.baseCommissionRate : null;
    }, [formData.salespersonId, salespeople]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selected = salespeople.find(sp => sp.id === formData.salespersonId);
        if (!selected) {
            alert("Please select a valid salesperson.");
            return;
        }

        onAdd({
            salespersonId: formData.salespersonId,
            revenue: parseFloat(formData.revenue),
            commissionRate: selected.baseCommissionRate,
            status: PaymentStatus.Unpaid,
            isAdvance: false,
            entryDate: new Date().toISOString().split('T')[0],
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <Select label="Salesperson" name="salespersonId" value={formData.salespersonId} onChange={handleChange} required>
                <option value="">Select a person</option>
                {salespeople.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </Select>
            <Input label="Revenue Generated" name="revenue" type="number" value={formData.revenue} onChange={handleChange} required />
             <div className="pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Base Commission Rate: 
                    <span className="font-semibold"> {selectedSalespersonRate !== null ? `${selectedSalespersonRate}%` : 'N/A (Select a salesperson)'}</span>
                </p>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
                <Button type="submit" disabled={selectedSalespersonRate === null}>Add Commission</Button>
            </div>
        </form>
    );
};

const Commissions: React.FC<CommissionsProps> = ({ commissions, salespeople, onAddCommission, onUpdateCommission }) => {
    const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const filteredCommissions = commissions.filter(c => filter === 'all' || c.status === filter);
    const getSalesperson = (id: string) => salespeople.find(sp => sp.id === id);
    
    const handleTogglePaymentStatus = (commission: Commission) => {
        const isPaid = commission.status === PaymentStatus.Paid;
        onUpdateCommission({
            ...commission,
            status: isPaid ? PaymentStatus.Unpaid : PaymentStatus.Paid,
            paymentDate: isPaid ? undefined : new Date().toISOString().split('T')[0]
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Commissions</h2>
                <Button onClick={() => setIsModalOpen(true)} disabled={salespeople.length === 0} title={salespeople.length === 0 ? "Add a salesperson first" : "Add Commission"}>
                    <Icon.Plus className="w-5 h-5 mr-2" />
                    Add Commission
                </Button>
            </div>

            <Card>
                <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
                    <h3 className="font-semibold">All Commissions</h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Filter by status:</span>
                         <Select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="w-32">
                            <option value="all">All</option>
                            <option value={PaymentStatus.Unpaid}>Unpaid</option>
                            <option value={PaymentStatus.Paid}>Paid</option>
                        </Select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Salesperson</th>
                                <th scope="col" className="px-6 py-3">Entry Date</th>
                                <th scope="col" className="px-6 py-3">Revenue</th>
                                <th scope="col" className="px-6 py-3">Base Commission</th>
                                <th scope="col" className="px-6 py-3">Rappel Bonus</th>
                                <th scope="col" className="px-6 py-3">Total</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCommissions.length > 0 ? (
                                filteredCommissions.map(c => {
                                    const salesperson = getSalesperson(c.salespersonId);
                                    const baseCommission = c.revenue * (c.commissionRate / 100);
                                    const total = baseCommission + c.rappelBonus;
                                    return (
                                        <tr key={c.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{salesperson?.name || 'N/A'}</td>
                                            <td className="px-6 py-4">{c.entryDate}</td>
                                            <td className="px-6 py-4">{formatCurrency(c.revenue)}</td>
                                            <td className="px-6 py-4">{formatCurrency(baseCommission)} ({c.commissionRate}%)</td>
                                            <td className="px-6 py-4 text-green-500">{formatCurrency(c.rappelBonus)}</td>
                                            <td className="px-6 py-4 font-bold">{formatCurrency(total)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.status === PaymentStatus.Paid ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>{c.status}</span>
                                            </td>
                                            <td className="px-6 py-4 flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleTogglePaymentStatus(c)}
                                                    variant={c.status === PaymentStatus.Unpaid ? 'primary' : 'secondary'}
                                                >
                                                    {c.status === PaymentStatus.Unpaid ? 'Mark as Paid' : 'Mark as Unpaid'}
                                                </Button>
                                                {c.status === PaymentStatus.Paid && salesperson && (
                                                     <Button size="sm" variant="secondary" onClick={() => generateReceiptPdf(c, salesperson)}>
                                                        <Icon.FileText className="w-4 h-4 mr-1"/>
                                                        Receipt
                                                     </Button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No commissions found. Add one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Commission">
                <CommissionForm salespeople={salespeople} onAdd={onAddCommission} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Commissions;