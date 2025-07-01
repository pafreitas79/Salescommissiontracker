import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Salesperson, Commission, RappelTier, PaymentStatus, RappelCalculationMethod } from './types';
import { INITIAL_RAPPEL_TIERS } from './constants';
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
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [commissions, setCommissions] = useState<Commission[]>(() => {
        try {
            const saved = localStorage.getItem('commissions');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
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
    const [rappelMethod, setRappelMethod] = useState<RappelCalculationMethod>(() => {
        try {
            const saved = localStorage.getItem('rappelMethod');
            return saved ? JSON.parse(saved) : 'rolling';
        } catch {
            return 'rolling';
        }
    });
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    const recalculateAllCommissions = useCallback((
        currentCommissions: Commission[],
        currentTiers: RappelTier[],
        currentMethod: RappelCalculationMethod
    ): Commission[] => {
        const sortedTiers = [...currentTiers].sort((a, b) => b.threshold - a.threshold);
        
        const commissionsBySalesperson: { [key: string]: Commission[] } = {};
        currentCommissions.forEach(c => {
            if (!commissionsBySalesperson[c.salespersonId]) {
                commissionsBySalesperson[c.salespersonId] = [];
            }
            commissionsBySalesperson[c.salespersonId].push(c);
        });

        const newCommissions: Commission[] = [];

        Object.values(commissionsBySalesperson).forEach(personCommissions => {
            const sortedPersonCommissions = [...personCommissions].sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
            
            sortedPersonCommissions.forEach((commission, index) => {
                const entryDate = new Date(commission.entryDate);
                let performanceRevenue = 0;

                const historicalCommissions = sortedPersonCommissions.slice(0, index);

                if (currentMethod === 'rolling') {
                    const twelveMonthsAgo = new Date(entryDate);
                    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
                    performanceRevenue = historicalCommissions
                        .filter(c => new Date(c.entryDate) >= twelveMonthsAgo)
                        .reduce((sum, c) => sum + c.revenue, 0);
                } else { // ytd
                    const startOfYear = new Date(entryDate.getFullYear(), 0, 1);
                     performanceRevenue = historicalCommissions
                        .filter(c => new Date(c.entryDate) >= startOfYear)
                        .reduce((sum, c) => sum + c.revenue, 0);
                }

                const applicableRappel = sortedTiers.find(tier => performanceRevenue >= tier.threshold);
                const rappelBonus = applicableRappel ? commission.revenue * (applicableRappel.bonusPercentage / 100) : 0;
                
                newCommissions.push({ ...commission, rappelBonus });
            });
        });

        return newCommissions;
    }, []);

    useEffect(() => {
        localStorage.setItem('salespeople', JSON.stringify(salespeople));
    }, [salespeople]);

    useEffect(() => {
        localStorage.setItem('commissions', JSON.stringify(commissions));
    }, [commissions]);

    useEffect(() => {
        localStorage.setItem('rappelTiers', JSON.stringify(rappelTiers));
        setCommissions(prev => recalculateAllCommissions(prev, rappelTiers, rappelMethod));
    }, [rappelTiers, rappelMethod, recalculateAllCommissions]);
    
    useEffect(() => {
        localStorage.setItem('rappelMethod', JSON.stringify(rappelMethod));
    }, [rappelMethod]);

    const handleAddCommission = (commission: Omit<Commission, 'id' | 'rappelBonus'>) => {
        const newCommission = { ...commission, id: `comm-${Date.now()}`, rappelBonus: 0 };
        const updatedCommissions = [...commissions, newCommission];
        setCommissions(recalculateAllCommissions(updatedCommissions, rappelTiers, rappelMethod));
    };

    const handleUpdateCommission = (updatedCommission: Commission) => {
        setCommissions(prev => prev.map(c => c.id === updatedCommission.id ? updatedCommission : c));
    };

    const handleUpdateRappelTiers = (tiers: RappelTier[]) => {
        setRappelTiers(tiers);
    };
    
    const handleUpdateRappelMethod = (method: RappelCalculationMethod) => {
        setRappelMethod(method);
    };

    const handleAddSalesperson = (person: Omit<Salesperson, 'id'>) => {
        setSalespeople(prev => [...prev, { ...person, id: `sp-${Date.now()}` }]);
    };

    const handleUpdateSalesperson = (updatedPerson: Salesperson) => {
        setSalespeople(prev => prev.map(sp => sp.id === updatedPerson.id ? updatedPerson : sp));
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
            localStorage.clear();
            window.location.reload();
        }
    };

    const salesData = useMemo(() => {
        return salespeople.map(sp => {
            const personCommissions = commissions.filter(c => c.salespersonId === sp.id);
            const totalRevenue = personCommissions.reduce((sum, c) => sum + c.revenue, 0);
            const baseCommissions = personCommissions.reduce((sum, c) => sum + (c.revenue * (c.commissionRate / 100)), 0);
            const totalRappelBonus = personCommissions.reduce((sum, c) => sum + (c.rappelBonus || 0), 0);
            const totalCommission = baseCommissions + totalRappelBonus;

            const totalPaid = personCommissions
                .filter(c => c.status === PaymentStatus.Paid)
                .reduce((sum, c) => sum + (c.revenue * (c.commissionRate / 100)) + (c.rappelBonus || 0), 0);
            
            const revenueLast12Months = personCommissions.filter(c => {
                 const entryDate = new Date(c.entryDate);
                 const twelveMonthsAgo = new Date();
                 twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
                 return entryDate >= twelveMonthsAgo;
            }).reduce((sum, c) => sum + c.revenue, 0);

            return {
                ...sp,
                totalRevenue,
                revenueLast12Months, // Note: This is for display only, not for calculation.
                baseCommissions,
                rappelBonus: totalRappelBonus,
                totalCommission,
                totalPaid,
                balance: totalCommission - totalPaid,
                commissionHistory: personCommissions,
            };
        });
    }, [salespeople, commissions]);

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
                            onUpdateSalesperson={handleUpdateSalesperson}
                            onDeleteSalesperson={handleDeleteSalesperson}
                        />;
            case 'rappel':
                return <RappelSettings 
                            tiers={rappelTiers} 
                            method={rappelMethod}
                            onUpdateTiers={handleUpdateRappelTiers}
                            onUpdateMethod={handleUpdateRappelMethod} 
                        />;
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