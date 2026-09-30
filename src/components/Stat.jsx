import React from 'react';

export default function Stat({
  title,
  value,
  note,
  icon: Icon
}) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{title}</span>

        <i>
          <Icon size={18} />
        </i>
      </div>

      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}