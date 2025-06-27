
import React, { useState } from 'react';
import { SalesData } from '../types';
import { Card } from './ui/Card';
import { Icon } from './ui/Icon';
import Modal from './ui/Modal';

interface DashboardProps {
    salesData: SalesData[];
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const SalespersonCard: React.FC<{ data: SalesData; onShowDetails: (data: SalesData) => void }> = ({ data, onShowDetails }) => {
    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{data.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{data.email}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-600 dark:text-gray-300">{data.name.charAt(0)}</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Revenue (Last 12mo)</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{formatCurrency(data.revenueLast12Months)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Rappel Bonus</p>
                        <p className="text-lg font-semibold text-green-500">{formatCurrency(data.rappelBonus)}</p>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">All-Time Revenue</span>
                        <span className="font-semibold text-gray-800 dark:text-white">{formatCurrency(data.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Total Commission</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(data.totalCommission)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Total Paid</span>
                        <span className="font-semibold text-green-600">{formatCurrency(data.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">Balance Due</span>
                        <span className="font-bold text-red-500">{formatCurrency(data.balance)}</span>
                    </div>
                </div>

                <div className="mt-6">
                    <button 
                        onClick={() => onShowDetails(data)}
                        className="w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </Card>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ salesData }) => {
    const [selectedSalesperson, setSelectedSalesperson] = useState<SalesData | null>(null);

    const totalRevenue = salesData.reduce((sum, sp) => sum + sp.totalRevenue, 0);
    const totalCommissions = salesData.reduce((sum, sp) => sum + sp.totalCommission, 0);
    const totalPaid = salesData.reduce((sum, sp) => sum + sp.totalPaid, 0);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-full"><Icon.Dollar className="w-6 h-6"/></div>
                        <div>
                            <p className="text-sm font-light">Total Revenue</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                        </div>
                    </div>
                </Card>
                 <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6">
                     <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-full"><Icon.Check className="w-6 h-6"/></div>
                        <div>
                            <p className="text-sm font-light">Total Commissions</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalCommissions)}</p>
                        </div>
                    </div>
                </Card>
                 <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6">
                     <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-full"><Icon.Wallet className="w-6 h-6"/></div>
                        <div>
                            <p className="text-sm font-light">Total Paid Out</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-10">Salesperson Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {salesData.map(sp => (
                    <SalespersonCard key={sp.id} data={sp} onShowDetails={setSelectedSalesperson} />
                ))}
            </div>

            {selectedSalesperson && (
                <Modal isOpen={!!selectedSalesperson} onClose={() => setSelectedSalesperson(null)} title={`${selectedSalesperson.name}'s Details`}>
                    <div className="p-6 space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Commission</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(selectedSalesperson.totalCommission)}</p>
                            </div>
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Balance Due</p>
                                <p className="text-lg font-bold text-red-500">{formatCurrency(selectedSalesperson.balance)}</p>
                            </div>
                        </div>
                        <h4 className="font-bold text-lg mt-4">Payment History</h4>
                        <div className="max-h-64 overflow-y-auto pr-2">
                             <table className="w-full text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Revenue</th>
                                        <th className="px-4 py-2">Commission</th>
                                        <th className="px-4 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSalesperson.commissionHistory.map(c => (
                                        <tr key={c.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-2">{c.entryDate}</td>
                                            <td className="px-4 py-2">{formatCurrency(c.revenue)}</td>
                                            <td className="px-4 py-2">{formatCurrency(c.revenue * (c.commissionRate / 100))}</td>
                                            <td className={`px-4 py-2 font-semibold ${c.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>{c.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;
