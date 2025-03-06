import React from 'react';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
    checked,
    onChange,
    label,
    className = ''
}) => {
    return (
        <label className={`inline-flex items-center cursor-pointer ${className}`}>
            {label && (
                <span className="mr-3 text-sm font-medium text-gray-900">{label}</span>
            )}
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked}
                    onChange={e => onChange(e.target.checked)}
                />
                <div className={`
                    w-11 h-6 bg-gray-200 rounded-full peer
                    peer-checked:after:translate-x-full
                    peer-checked:bg-blue-600
                    after:content-['']
                    after:absolute
                    after:top-[2px]
                    after:left-[2px]
                    after:bg-white
                    after:border-gray-300
                    after:border
                    after:rounded-full
                    after:h-5
                    after:w-5
                    after:transition-all
                `}></div>
            </div>
        </label>
    );
}; 