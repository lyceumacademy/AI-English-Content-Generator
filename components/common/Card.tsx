
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, actions }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6">
        <header className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{title}</h2>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </header>
        <div className="text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};