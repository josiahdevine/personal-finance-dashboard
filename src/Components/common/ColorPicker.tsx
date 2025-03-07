import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  return (
    <div className="flex items-center space-x-2 mt-1">
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 rounded cursor-pointer"
      />
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
};

export default ColorPicker; 