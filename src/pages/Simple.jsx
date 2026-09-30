import React from 'react';

export default function Simple({ title, text }) {
  return (
    <>
      <div className="welcome">
        <div>
          <div className="eyebrow">
            PREFERÊNCIAS
          </div>

          <h1>{title}</h1>
          <p>{text}</p>
        </div>
      </div>

      <section className="panel empty">
        Esta área será configurada na próxima etapa.
      </section>
    </>
  );
}