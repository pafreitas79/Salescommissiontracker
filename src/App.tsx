
import React, { useState, useMemo, useEffect } from 'react';
import { Salesperson, Commission, RappelTier, PaymentStatus } from './types';
import { INITIAL_SALESPEOPLE, INITIAL_COMMISSIONS, INITIAL_RAPPEL_TIERS } from './constants';
import Dashboard from './components/Dashboard';
import Commissions from './components/Commissions';
import RappelSettings from './components/RappelSettings';
import SalespeopleManagement from './components/SalespeopleManagement';
import { Icon } from './components/ui/Icon';

type Tab = 'dashboard' | 'commissions' | 'salespeople' | 'rappel';

const App: React.FC = () => {
    const [salespeople, setSalespeople] = useState<Salesperson[]>(() => {
        try {
            const saved = localStorage.getItem('salespeople');
            return saved ? JSON.parse(saved) : INITIAL_SALESPEOPLE;
        } catch {
            return INITIAL_SALESPEOPLE;
        }
    });
    const [commissions, setCommissions] = useState<Commission[]>(() => {
        try {
            const saved = localStorage.getItem('commissions');
            return saved ? JSON.parse(saved) : INITIAL_COMMISSIONS;
        } catch {
            return INITIAL_COMMISSIONS;
        }
    });
    const [rappelTiers, setRappelTiers] = useState<RappelTier[]>(() => {
        try {
            const saved = localStorage.getItem('rappelTiers');
            return saved ? JSON.parse(saved) : INITIAL_RAPPEL_TIERS;
        } catch {
            return INITIAL_RAPPEL_TIERS;
        }
    });
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    useEffect(() => {
        localStorage.setItem('salespeople', JSON.stringify(salespeople));
    }, [salespeople]);

    useEffect(() => {
        localStorage.setItem('commissions', JSON.stringify(commissions));
    }, [commissions]);

    useEffect(() => {
        localStorage.setItem('rappelTiers', JSON.stringify(rappelTiers));
    }, [rappelTiers]);

    const handleAddCommission = (commission: Omit<Commission, 'id'>) => {
        setCommissions(prev => [...prev, { ...commission, id: `comm-${Date.now()}` }]);
    };

    const handleUpdateCommission = (updatedCommission: Commission) => {
        setCommissions(prev => prev.map(c => c.id === updatedCommission.id ? updatedCommission : c));
    };

    const handleUpdateRappelTiers = (tiers: RappelTier[]) => {
        setRappelTiers(tiers);
    };

    const handleAddSalesperson = (person: Omit<Salesperson, 'id'>) => {
        setSalespeople(prev => [...prev, { ...person, id: `sp-${Date.now()}` }]);
    };

    const handleDeleteSalesperson = (salespersonId: string) => {
        if (commissions.some(c => c.salespersonId === salespersonId)) {
            alert('Cannot delete salesperson with existing commissions. Please reassign or delete their commissions first.');
            return;
        }
        setSalespeople(prev => prev.filter(sp => sp.id !== salespersonId));
    };
    
    const handleClearData = () => {
        if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
            localStorage.removeItem('salespeople');
            localStorage.removeItem('commissions');
            localStorage.removeItem('rappelTiers');
            window.location.reload();
        }
    };


    const salesData = useMemo(() => {
        const today = new Date();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setFullYear(today.getFullYear() - 1);

        return salespeople.map(sp => {
            const personCommissions = commissions.filter(c => c.salespersonId === sp.id);
            const totalRevenue = personCommissions.reduce((sum, c) => sum + c.revenue, 0);
            
            // Calculate revenue in the last 12 months for rappel
            const commissionsLast12Months = personCommissions.filter(c => {
                const entryDate = new Date(c.entryDate);
                return entryDate >= twelveMonthsAgo && entryDate <= today;
            });
            const revenueLast12Months = commissionsLast12Months.reduce((sum, c) => sum + c.revenue, 0);

            const applicableRappel = [...rappelTiers]
                .sort((a, b) => b.threshold - a.threshold)
                .find(tier => revenueLast12Months >= tier.threshold);
            
            // Rappel bonus is based on revenue from the last 12 months
            const rappelBonus = applicableRappel ? revenueLast12Months * (applicableRappel.bonusPercentage / 100) : 0;

            const baseCommissions = personCommissions.reduce((sum, c) => sum + (c.revenue * (c.commissionRate / 100)), 0);
            const totalCommission = baseCommissions + rappelBonus;

            const paidCommissions = personCommissions
                .filter(c => c.status === PaymentStatus.Paid)
                .reduce((sum, c) => sum + (c.revenue * (c.commissionRate / 100)), 0);

            return {
                ...sp,
                totalRevenue,
                revenueLast12Months,
                baseCommissions,
                rappelBonus,
                totalCommission,
                totalPaid: paidCommissions,
                balance: totalCommission - paidCommissions,
                commissionHistory: personCommissions,
            };
        });
    }, [salespeople, commissions, rappelTiers]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard salesData={salesData} />;
            case 'commissions':
                return <Commissions 
                            commissions={commissions} 
                            salespeople={salespeople}
                            onAddCommission={handleAddCommission}
                            onUpdateCommission={handleUpdateCommission}
                        />;
            case 'salespeople':
                return <SalespeopleManagement 
                            salespeople={salespeople}
                            commissions={commissions}
                            onAddSalesperson={handleAddSalesperson}
                            onDeleteSalesperson={handleDeleteSalesperson}
                        />;
            case 'rappel':
                return <RappelSettings tiers={rappelTiers} onUpdateTiers={handleUpdateRappelTiers} />;
            default:
                return null;
        }
    };

    const NavItem: React.FC<{ tab: Tab; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full ${
                activeTab === tab 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100 dark:bg-gray-900">
            <nav className="w-full lg:w-64 bg-white dark:bg-gray-800 shadow-xl p-4 lg:p-6 flex flex-row lg:flex-col justify-between lg:justify-start">
                <div>
                    <div className="flex items-center space-x-3 mb-8">
                        <Icon.Logo className="w-10 h-10 text-blue-600" />
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">CommTrack</h1>
                    </div>
                    <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                        <NavItem tab="dashboard" label="Dashboard" icon={<Icon.Dashboard className="w-6 h-6" />} />
                        <NavItem tab="commissions" label="Commissions" icon={<Icon.Dollar className="w-6 h-6" />} />
                        <NavItem tab="salespeople" label="Salespeople" icon={<Icon.Users className="w-6 h-6" />} />
                        <NavItem tab="rappel" label="Rappel Settings" icon={<Icon.Settings className="w-6 h-6" />} />
                    </div>
                </div>
                <div className="hidden lg:flex flex-col space-y-2 mt-auto">
                     <button 
                        onClick={handleClearData}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-gray-500 hover:bg-red-100 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-800/50 dark:hover:text-red-400"
                    >
                       <Icon.Trash className="w-6 h-6" />
                       <span className="font-medium">Clear All Data</span>
                    </button>
                    <button className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700">
                       <Icon.Logout className="w-6 h-6" />
                       <span className="font-medium">Logout</span>
                    </button>
                </div>
            </nav>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
