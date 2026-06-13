import React, { useEffect, useState, useRef } from 'react';

interface TimerProps {
  seconds: number;
  onTimeout: () => void;
  resetKey: number;
}

export const Timer: React.FC<TimerProps> = ({ seconds, onTimeout, resetKey }) => {
  const [remaining, setRemaining] = useState(seconds);
  const firedRef = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    firedRef.current = false;
  }, [resetKey, seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      if (!firedRef.current) {
        firedRef.current = true;
        onTimeout();
      }
      return;
    }
    const t = setTimeout(() => setRemaining(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onTimeout]);

  const isWarning = remaining <= 5;

  return (
    <div className={`timer ${isWarning ? 'warning' : ''}`}>
      {remaining}s
    </div>
  );
};
