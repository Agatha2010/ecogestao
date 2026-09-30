import React from 'react';

export default function Status({ value }) {
  const classe = (value || '')
    .toLowerCase()
    .replaceAll(' ', '-');

  return (
    <span className={'status ' + classe}>
      {value}
    </span>
  );
}