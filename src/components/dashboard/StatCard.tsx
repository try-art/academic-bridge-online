
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
}

// Componente para mostrar estadísticas
const StatCard = ({ title, value, icon, change, isPositive }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <div className={`flex items-center mt-2 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                <span className="ml-1">{change}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${isPositive === undefined ? 'bg-blue-100 text-blue-600' : isPositive ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
