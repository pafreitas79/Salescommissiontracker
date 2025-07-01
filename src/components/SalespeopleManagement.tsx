
import React, { useState, useEffect } from 'react';
import { Salesperson, Commission } from '../types';
import { Card } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './ui/Modal';
import { Icon } from './ui/Icon';

interface SalespeopleManagementProps {
    salespeople: Salesperson[];
    commissions: Commission[];
    onAddSalesperson: (person: Omit<Salesperson, 'id' | 'baseCommissionRate'> & { baseCommissionRate: number }) => void;
    onUpdateSalesperson: (person: Salesperson) => void;
    onDeleteSalesperson: (id: string) => void;
}

const SalespersonForm: React.FC<{
    onSubmit: (data: any) => void;
    onClose: () => void;
    initialData?: Salesperson | null;
}> = ({ onSubmit, onClose, initialData }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        baseCommissionRate: initialData?.baseCommissionRate?.toString() || '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email,
                baseCommissionRate: initialData.baseCommissionRate.toString(),
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.email && formData.baseCommissionRate) {
            onSubmit({
                ...initialData,
                name: formData.name,
                email: formData.email,
                baseCommissionRate: parseFloat(formData.baseCommissionRate),
            });
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <Input label="Full Name" name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="e.g., Jane Doe" />
            <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="e.g., jane.doe@example.com" />
            <Input label="Base Commission Rate (%)" name="baseCommissionRate" type="number" value={formData.baseCommissionRate} onChange={handleChange} required placeholder="e.g., 30" />
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
                <Button type="submit">{initialData ? 'Save Changes' : 'Add Salesperson'}</Button>
            </div>
        </form>
    );
};

const SalespeopleManagement: React.FC<SalespeopleManagementProps> = ({ salespeople, commissions, onAddSalesperson, onUpdateSalesperson, onDeleteSalesperson }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSalesperson, setEditingSalesperson] = useState<Salesperson | null>(null);
    
    const hasCommissions = (salespersonId: string) => {
        return commissions.some(c => c.salespersonId === salespersonId);
    };

    const handleOpenAddModal = () => {
        setEditingSalesperson(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (person: Salesperson) => {
        setEditingSalesperson(person);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSalesperson(null);
    };

    const handleSubmit = (data: Salesperson) => {
        if (editingSalesperson) {
            onUpdateSalesperson(data);
        } else {
            onAddSalesperson(data);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Salespeople</h2>
                <Button onClick={handleOpenAddModal}>
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
                                <th scope="col" className="px-6 py-3">Base Rate</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salespeople.map(sp => (
                                <tr key={sp.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{sp.name}</td>
                                    <td className="px-6 py-4">{sp.email}</td>
                                    <td className="px-6 py-4 font-semibold">{sp.baseCommissionRate}%</td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenEditModal(sp)} title="Edit salesperson">
                                           <Icon.Edit className="w-4 h-4" />
                                        </Button>
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSalesperson ? 'Edit Salesperson' : 'Add New Salesperson'}>
                <SalespersonForm onSubmit={handleSubmit} onClose={handleCloseModal} initialData={editingSalesperson} />
            </Modal>
        </div>
    );
};

export default SalespeopleManagement;
