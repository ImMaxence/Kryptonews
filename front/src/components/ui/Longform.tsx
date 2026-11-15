import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { PageHead } from './PageHead';

export interface LongformSection {
  id: string;
  title: string;
  body: ReactNode;
}

/** Long-form page (legal, about): numbered table of contents + sections. */
export async function Longform({
  kicker,
  title,
  deck,
  sections,
  updated,
}: {
  kicker: string;
  title: string;
  deck?: string;
  sections: LongformSection[];
  updated?: string;
}) {
  const t = await getTranslations('common');
  return (
    <div className="wrap page">
      <PageHead kicker={kicker} title={title} deck={deck} />
      <div className="longform">
        <nav className="longform__toc" aria-labelledby="toc-title">
          <p id="toc-title" className="kicker">
            {t('onThisPage')}
          </p>
          <ol>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="longform__body">
          {sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.body}
            </section>
          ))}
          {updated && <p className="longform__updated">{t('lastUpdated', { date: updated })}</p>}
        </div>
      </div>
    </div>
  );
}
