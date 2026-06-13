import React, { useEffect, useState } from 'react';

interface ComboPopupProps {
  combo: number;
  key_: number;
}

export const ComboPopup: React.FC<ComboPopupProps> = ({ combo, key_ }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (combo >= 3) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 800);
      return () => clearTimeout(t);
    }
  }, [combo, key_]);

  if (!visible) return null;

  let label = '';
  if (combo >= 10) label = `🔥 ${combo}连击！超神！`;
  else if (combo >= 7) label = `🔥 ${combo}连击！太强了！`;
  else if (combo >= 5) label = `🔥 ${combo}连击！厉害！`;
  else label = `🔥 ${combo}连击！`;

  return <div className="combo-popup" key={key_}>{label}</div>;
};
