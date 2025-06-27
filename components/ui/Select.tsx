
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, className, children, ...props }) => {
    const selectId = id || props.name;
    return (
        <div className="w-full">
            {label && <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
            <select
                id={selectId}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
                {...props}
            >
                {children}
            </select>
        </div>
    );
};

export default Select;
