import React from 'react';

interface LivesProps {
  remaining: number;
  max: number;
}

export const Lives: React.FC<LivesProps> = ({ remaining, max }) => {
  const hearts = [];
  for (let i = 0; i < max; i++) {
    hearts.push(
      <span key={i} style={{ opacity: i < remaining ? 1 : 0.3 }}>
        {i < remaining ? '❤️' : '🖤'}
      </span>,
    );
  }
  return <div className="lives">{hearts}</div>;
};
