import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import '../css/SharedComponents.css';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'indigo',
  trend,
  trendType = 'up' // 'up' | 'down' | 'neutral'
}) => {
  return (
    <div className="em-stat-card">
      <div className="em-stat-card-top">
        <div className={`em-stat-icon-wrapper em-stat-icon-${colorScheme}`}>
          {Icon && <Icon size={22} />}
        </div>
        {trend && (
          <div className={`em-stat-trend trend-${trendType}`}>
            {trendType === 'up' && <TrendingUp size={13} />}
            {trendType === 'down' && <TrendingDown size={13} />}
            {trendType === 'neutral' && <Minus size={13} />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <div className="em-stat-value">{value}</div>
        <div className="em-stat-title">{title}</div>
        {subtitle && <div className="em-stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;
