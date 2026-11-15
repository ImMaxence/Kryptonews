import type { ReactNode } from 'react';

export function PageHead({ kicker, title, deck, children }: { kicker: string; title: string; deck?: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <p className="kicker kicker--accent">{kicker}</p>
      <h1 className="page-head__title">{title}</h1>
      {deck && <p className="page-head__deck">{deck}</p>}
      {children && <div className="page-head__meta">{children}</div>}
    </header>
  );
}
