import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { ParsedCsvRow } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { Icon } from './ui/Icon';

interface CsvImportButtonProps {
    onImport: (data: ParsedCsvRow[]) => void;
}

export const CsvImportButton: React.FC<CsvImportButtonProps> = ({ onImport }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setIsModalOpen(false);

        Papa.parse<ParsedCsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                onImport(results.data);
                setIsLoading(false);
                // Reset file input value to allow re-uploading the same file
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            },
            error: (error) => {
                console.error("CSV parsing error:", error);
                alert("An error occurred while parsing the CSV file. Please check the console for details.");
                setIsLoading(false);
            },
        });
    };

    const handleButtonClick = () => {
        setIsModalOpen(true);
    };
    
    const handleSelectFileClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
            />
            <Button onClick={handleButtonClick} variant="secondary" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Icon.Save className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Icon.Upload className="w-5 h-5 mr-2" />
                        Import from CSV
                    </>
                )}
            </Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Import Commissions from CSV">
                <div className="p-6 space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">Upload a CSV file to import historical commissions. The file must have the following columns:</p>
                    <ul className="list-disc list-inside bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm">
                        <li><code className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">salesperson_email</code> (Required)</li>
                        <li><code className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">revenue</code> (Required, number only)</li>
                        <li><code className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">deal_id</code> (Required)</li>
                        <li><code className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">entry_date</code> (Required, format: YYYY-MM-DD)</li>
                        <li><code className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">status</code> (Required, either 'Paid' or 'Unpaid')</li>
                        <li><code className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">payment_date</code> (Optional, format: YYYY-MM-DD)</li>
                        <li><code className="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">salesperson_name</code> (Optional, used if creating a new salesperson)</li>
                    </ul>
                    <p className="text-xs text-gray-500">
                        If a salesperson with the given email does not exist, they will be automatically created with a default commission rate.
                    </p>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button onClick={() => setIsModalOpen(false)} variant="secondary">Cancel</Button>
                        <Button onClick={handleSelectFileClick}>Select File</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
