import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
};
