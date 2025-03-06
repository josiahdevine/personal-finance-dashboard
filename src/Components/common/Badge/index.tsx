import React from 'react';

interface BadgeProps {
    variant: 'info' | 'success' | 'warning' | 'error';
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    variant,
    children,
    className = ''
}) => {
    const variantClasses = {
        info: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-orange-100 text-orange-800',
        error: 'bg-red-100 text-red-800'
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
        >
            {children}
        </span>
    );
}; 