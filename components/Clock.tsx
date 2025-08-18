
import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

const Clock: React.FC = () => {
  const [date, setDate] = useState(() => DateTime.now().setZone('America/Sao_Paulo'));

  useEffect(() => {
    const timerId = setInterval(() => {
        setDate(DateTime.now().setZone('America/Sao_Paulo'));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="text-right">
      <p className="text-sm font-semibold text-text tabular-nums">{date.toFormat('HH:mm:ss')}</p>
      <p className="text-xs text-text-secondary tabular-nums">{date.toFormat('dd/MM/yyyy')}</p>
    </div>
  );
};

export default Clock;