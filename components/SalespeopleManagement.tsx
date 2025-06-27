
import React, { useState } from 'react';
import { Salesperson, Commission } from '../types';
import { Card } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './ui/Modal';
import { Icon } from './ui/Icon';

interface SalespeopleManagementProps {
    salespeople: Salesperson[];
    commissions: Commission[];
    onAddSalesperson: (person: Omit<Salesperson, 'id'>) => void;
    onDeleteSalesperson: (id: string) => void;
}

const AddSalespersonForm: React.FC<{ onAdd: (data: Omit<Salesperson, 'id'>) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
    const [formData, setFormData] = useState({ name: '', email: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email) {
            onAdd(formData);
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <Input label="Full Name" name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="e.g., Jane Doe" />
            <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="e.g., jane.doe@example.com" />
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
                <Button type="submit">Add Salesperson</Button>
            </div>
        </form>
    );
};

const SalespeopleManagement: React.FC<SalespeopleManagementProps> = ({ salespeople, commissions, onAddSalesperson, onDeleteSalesperson }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const hasCommissions = (salespersonId: string) => {
        return commissions.some(c => c.salespersonId === salespersonId);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Salespeople</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Icon.Plus className="w-5 h-5 mr-2" />
                    Add Salesperson
                </Button>
            </div>

            <Card>
                 <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold">Current Sales Team</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Has Commissions?</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salespeople.map(sp => (
                                <tr key={sp.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{sp.name}</td>
                                    <td className="px-6 py-4">{sp.email}</td>
                                    <td className="px-6 py-4">{hasCommissions(sp.id) ? 'Yes' : 'No'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => onDeleteSalesperson(sp.id)}
                                            disabled={hasCommissions(sp.id)}
                                            title={hasCommissions(sp.id) ? 'Cannot delete: salesperson has commissions' : 'Delete salesperson'}
                                            className={hasCommissions(sp.id) ? 'cursor-not-allowed opacity-50' : ''}
                                        >
                                            <Icon.Trash className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {salespeople.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No salespeople found. Add one to get started!
                        </div>
                    )}
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Salesperson">
                <AddSalespersonForm onAdd={onAddSalesperson} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default SalespeopleManagement;
