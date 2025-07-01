import React, { useState } from 'react';
import { RappelTier, RappelCalculationMethod } from '../types';
import { Card } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { Icon } from './ui/Icon';

interface RappelSettingsProps {
    tiers: RappelTier[];
    method: RappelCalculationMethod;
    onUpdateTiers: (tiers: RappelTier[]) => void;
    onUpdateMethod: (method: RappelCalculationMethod) => void;
}

const RappelSettings: React.FC<RappelSettingsProps> = ({ tiers, method, onUpdateTiers, onUpdateMethod }) => {
    const [editableTiers, setEditableTiers] = useState<RappelTier[]>(tiers);
    const [editableMethod, setEditableMethod] = useState<RappelCalculationMethod>(method);
    const [newTier, setNewTier] = useState({ threshold: '', bonusPercentage: '' });

    const handleTierChange = (id: string, field: 'threshold' | 'bonusPercentage', value: string) => {
        const updatedTiers = editableTiers.map(tier =>
            tier.id === id ? { ...tier, [field]: parseFloat(value) || 0 } : tier
        );
        setEditableTiers(updatedTiers);
    };
    
    const handleNewTierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTier({ ...newTier, [e.target.name]: e.target.value });
    };

    const handleAddTier = () => {
        if (newTier.threshold && newTier.bonusPercentage) {
            const newTierData: RappelTier = {
                id: `tier-${Date.now()}`,
                threshold: parseFloat(newTier.threshold),
                bonusPercentage: parseFloat(newTier.bonusPercentage)
            };
            const updatedTiers = [...editableTiers, newTierData];
            setEditableTiers(updatedTiers);
            setNewTier({ threshold: '', bonusPercentage: '' });
        }
    };
    
    const handleDeleteTier = (id: string) => {
        const updatedTiers = editableTiers.filter(tier => tier.id !== id);
        setEditableTiers(updatedTiers);
    };
    
    const handleSaveChanges = () => {
        onUpdateTiers(editableTiers.sort((a,b) => a.threshold - b.threshold));
        onUpdateMethod(editableMethod);
        alert("Rappel settings saved! All commissions have been recalculated.");
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Rappel Settings</h2>
            
             <Card>
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold text-lg">Calculation Method</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Choose how performance is measured to determine the bonus tier for each commission.
                    </p>
                    <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="rappelMethod"
                                value="rolling"
                                checked={editableMethod === 'rolling'}
                                onChange={() => setEditableMethod('rolling')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">Rolling 12 Months</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Based on revenue from the 12 months prior to the commission date.</p>
                            </div>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="rappelMethod"
                                value="ytd"
                                checked={editableMethod === 'ytd'}
                                onChange={() => setEditableMethod('ytd')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">Calendar Year-to-Date</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Based on revenue from Jan 1st of the commission's year.</p>
                            </div>
                        </label>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold text-lg">Bonus Tiers</h3>
                     <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Define revenue thresholds and the bonus percentage that will apply to a commission's revenue once the threshold is met.
                    </p>
                </div>
                <div className="p-6 space-y-4">
                    {editableTiers.sort((a,b) => a.threshold - b.threshold).map(tier => (
                        <div key={tier.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <Input
                                label="Performance Threshold ($)"
                                type="number"
                                value={String(tier.threshold)}
                                onChange={(e) => handleTierChange(tier.id, 'threshold', e.target.value)}
                            />
                            <Input
                                label="Bonus Percentage (%)"
                                type="number"
                                value={String(tier.bonusPercentage)}
                                onChange={(e) => handleTierChange(tier.id, 'bonusPercentage', e.target.value)}
                            />
                            <div className="flex items-end h-full">
                                <Button variant="danger" size="sm" onClick={() => handleDeleteTier(tier.id)} className="mt-auto">
                                    <Icon.Trash className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="font-semibold mb-2">Add New Tier</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <Input
                            label="Performance Threshold ($)"
                            name="threshold"
                            type="number"
                            value={newTier.threshold}
                            onChange={handleNewTierChange}
                            placeholder="e.g., 50000"
                        />
                        <Input
                            label="Bonus Percentage (%)"
                            name="bonusPercentage"
                            type="number"
                            value={newTier.bonusPercentage}
                            onChange={handleNewTierChange}
                            placeholder="e.g., 5"
                        />
                         <div className="flex items-end h-full">
                            <Button onClick={handleAddTier} className="w-full md:w-auto">Add Tier</Button>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveChanges}>
                    <Icon.Save className="w-5 h-5 mr-2" />
                    Save Changes & Recalculate
                </Button>
            </div>
        </div>
    );
};

export default RappelSettings;