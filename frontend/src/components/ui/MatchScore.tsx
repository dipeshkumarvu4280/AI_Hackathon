import React from 'react';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const MatchScore: React.FC<MatchScoreProps> = ({ score, size = 'sm' }) => {
  const getLabelAndStyle = () => {
    if (score >= 90) {
      return {
        label: 'Excellent Match',
        style: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    }
    if (score >= 75) {
      return {
        label: 'Strong Match',
        style: 'text-blue-700 bg-blue-50 border-blue-200',
      };
    }
    if (score >= 60) {
      return {
        label: 'Moderate Match',
        style: 'text-amber-700 bg-amber-50 border-amber-200',
      };
    }
    return {
      label: 'Low Match',
      style: 'text-red-700 bg-red-50 border-red-200',
    };
  };

  const { label, style } = getLabelAndStyle();

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${style}`}>
      <span>{label}</span>
      <span className="font-bold text-sm">{score}%</span>
    </div>
  );
};
