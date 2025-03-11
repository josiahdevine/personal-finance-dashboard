import React from 'react';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div>{children}</div>
    </div>
  );
};

export default Widget;
