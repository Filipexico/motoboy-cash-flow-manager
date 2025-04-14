
import React from 'react';
import { 
  ArrowDownIcon, 
  ArrowUpIcon,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  isCurrency = false,
  isPercentage = false,
  className
}) => {
  const formatValue = () => {
    if (isCurrency) {
      return typeof value === 'number' 
        ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : value;
    }
    
    if (isPercentage) {
      return typeof value === 'number' 
        ? `${value.toFixed(2)}%` 
        : value;
    }
    
    return typeof value === 'number' ? value.toLocaleString('pt-BR') : value;
  };

  const renderTrend = () => {
    if (trend === undefined) return null;
    
    const isPositive = trend > 0;
    const isNeutral = trend === 0;
    
    return (
      <div 
        className={cn(
          "flex items-center text-sm font-medium",
          isPositive ? "text-green-600" : (isNeutral ? "text-gray-500" : "text-red-600")
        )}
      >
        {isPositive ? (
          <ArrowUpIcon className="w-4 h-4 mr-1" />
        ) : isNeutral ? (
          <Minus className="w-4 h-4 mr-1" />
        ) : (
          <ArrowDownIcon className="w-4 h-4 mr-1" />
        )}
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className={cn("stats-card", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold">{formatValue()}</p>
      </div>
      {(description || trend !== undefined) && (
        <div className="mt-2 flex items-center justify-between">
          {description && <p className="text-sm text-gray-500">{description}</p>}
          {renderTrend()}
        </div>
      )}
    </div>
  );
};

export default StatCard;
