import React from 'react';

export default function Icon({ name, size = 18, className = '', style = {} }) {
  return (
    <img
      src={`/icons/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain', ...style }}
    />
  );
}