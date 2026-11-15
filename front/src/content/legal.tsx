import type { ReactNode } from 'react';
import type { LongformSection } from '@/components/ui/Longform';
import type { AppLocale } from '@/i18n/routing';
import { AUTHOR_URL, COINGECKO_URL, CONTACT_URL, REPO_URL } from '@/lib/site';

export type LegalPage = 'legal-notice' | 'privacy' | 'terms' | 'accessibility';

interface Ctx {
  locale: AppLocale;
  siteUrl: string;
  email: string | null;
  links: { privacy: string; terms: string; account: string; legalNotice: string };
}

const ext = (href: string, label: ReactNode) => (
  <a href={href} rel="noopener noreferrer">
    {label}
  </a>
);

function Contact({ ctx }: { ctx: Ctx }) {
  const fr = ctx.locale === 'fr';
  return ctx.email ? (
    <a href={`mailto:${ctx.email}`}>{ctx.email}</a>
  ) : (
    <>
      {fr ? 'le formulaire de contact de ' : 'the contact form on '}
      {ext(CONTACT_URL, 'mbonnici.fr')}
    </>
  );
}

/* ═══════════════════════════════ Mentions légales / Legal notice ═══════════════════════════════ */

function legalNotice(ctx: Ctx): LongformSection[] {
  const host = new URL(ctx.siteUrl).host;
  if (ctx.locale === 'fr') {
    return [
      {
        id: 'editeur',
        title: 'Éditeur du site',
        body: (
          <>
            <p>
              Le site <strong>{host}</strong> (« Kryptonews ») est édité par <strong>Maxence Bonnici</strong>, personne physique, à
              titre non professionnel.
            </p>
            <p>
              Directeur de la publication : Maxence Bonnici. Contact : <Contact ctx={ctx} />.
            </p>
          </>
        ),
      },
      {
        id: 'hebergement',
        title: 'Hébergement',
        body: (
          <>
            <p>
              Le site est hébergé sur un serveur personnel auto-hébergé en France, administré par l&apos;éditeur (conteneurs Docker
              orchestrés avec Coolify).
            </p>
            <p>
              Le trafic transite par <strong>Cloudflare, Inc.</strong>, 101 Townsend Street, San Francisco, CA 94107, États-Unis (
              {ext('https://www.cloudflare.com', 'cloudflare.com')}), qui assure la résolution DNS, la protection contre les attaques
              et la mise en cache.
            </p>
          </>
        ),
      },
      {
        id: 'projet',
        title: 'Origine du projet',
        body: (
          <p>
            Kryptonews est né en 2023 comme projet de groupe du programme MSc d&apos;Epitech (Maxence Bonnici, Maxence Laporte, Matéo
            Salvy, Meriem Boussaid, Federico Suarez). La version 2, en ligne depuis novembre 2026, est une refonte complète réalisée par
            Maxence Bonnici. Le code source est consultable sur {ext(REPO_URL, 'GitHub')}.
          </p>
        ),
      },
      {
        id: 'propriete',
        title: 'Propriété intellectuelle',
        body: (
          <>
            <p>
              Le code source de Kryptonews, charte graphique « Ledger Press » comprise, est publié sous {ext(`${REPO_URL}/blob/main/LICENSE`, 'licence MIT')}{' '}
              : vous pouvez le réutiliser librement en conservant la mention de copyright. Les textes éditoriaux du site appartiennent à
              leur auteur ; leur reproduction sans autorisation est interdite.
            </p>
            <p>
              Les titres, extraits et images des articles restent la propriété de leurs éditeurs respectifs. Kryptonews les affiche à
              partir des flux RSS publics que ces éditeurs mettent à disposition, sous forme de courte citation avec mention de la source
              et lien vers l&apos;article original. Tout éditeur peut demander le retrait de son flux via <Contact ctx={ctx} />.
            </p>
            <p>
              Les noms et logos des cryptomonnaies sont des marques de leurs projets respectifs. Les données de marché sont fournies par{' '}
              {ext(COINGECKO_URL, 'CoinGecko')}.
            </p>
          </>
        ),
      },
      {
        id: 'polices',
        title: 'Polices, icônes et illustrations',
        body: (
          <ul>
            <li>
              Polices Grenze Gotisch, Newsreader, Archivo et IBM Plex Mono, sous licence SIL Open Font License 1.1, servies depuis notre
              propre serveur (aucune requête vers Google Fonts).
            </li>
            <li>Icônes de l&apos;interface : SVG dessinés pour le projet. Le logo Google est une marque de Google LLC, utilisée uniquement pour identifier ce service de connexion.</li>
            <li>Portraits en pixel art : illustrations créées pour la première version de Kryptonews.</li>
          </ul>
        ),
      },
      {
        id: 'responsabilite',
        title: 'Responsabilité et avertissement',
        body: (
          <>
            <p>
              Les informations publiées (cours, variations, actualités) sont fournies à titre indicatif. Elles peuvent être inexactes,
              incomplètes ou différées. L&apos;éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de
              leur utilisation, ni du contenu des sites tiers vers lesquels renvoient les liens.
            </p>
            <p>
              <strong>Kryptonews ne fournit aucun conseil en investissement</strong>, aucune recommandation personnalisée et aucun
              service sur crypto-actifs. Les crypto-actifs sont des actifs très volatils : vous pouvez perdre tout ou partie du capital
              investi.
            </p>
          </>
        ),
      },
      {
        id: 'droit',
        title: 'Droit applicable',
        body: <p>Le présent site et ces mentions sont soumis au droit français.</p>,
      },
    ];
  }
  return [
    {
      id: 'publisher',
      title: 'Publisher',
      body: (
        <>
          <p>
            The website <strong>{host}</strong> (“Kryptonews”) is published by <strong>Maxence Bonnici</strong>, a private individual,
            on a non-professional basis.
          </p>
          <p>
            Publication director: Maxence Bonnici. Contact: <Contact ctx={ctx} />.
          </p>
        </>
      ),
    },
    {
      id: 'hosting',
      title: 'Hosting',
      body: (
        <>
          <p>
            The site runs on a self-hosted personal server in France, administered by the publisher (Docker containers orchestrated with
            Coolify).
          </p>
          <p>
            Traffic goes through <strong>Cloudflare, Inc.</strong>, 101 Townsend Street, San Francisco, CA 94107, USA (
            {ext('https://www.cloudflare.com', 'cloudflare.com')}), which provides DNS, attack protection and caching.
          </p>
        </>
      ),
    },
    {
      id: 'project',
      title: 'About the project',
      body: (
        <p>
          Kryptonews started in 2023 as a group project in the Epitech MSc programme (Maxence Bonnici, Maxence Laporte, Matéo Salvy,
          Meriem Boussaid, Federico Suarez). Version 2, online since November 2026, is a complete redesign by Maxence Bonnici. The
          source code is available on {ext(REPO_URL, 'GitHub')}.
        </p>
      ),
    },
    {
      id: 'ip',
      title: 'Intellectual property',
      body: (
        <>
          <p>
            The source code of Kryptonews, including the “Ledger Press” visual identity, is released under the{' '}
            {ext(`${REPO_URL}/blob/main/LICENSE`, 'MIT License')}: you may reuse it freely as long as the copyright notice is kept. The
            site&apos;s editorial texts belong to their author; reproducing them without permission is prohibited.
          </p>
          <p>
            Article titles, excerpts and images remain the property of their publishers. Kryptonews displays them from the public RSS
            feeds those publishers provide, as short quotations with the source named and a link to the original article. Any publisher
            can ask for its feed to be removed via <Contact ctx={ctx} />.
          </p>
          <p>
            Cryptocurrency names and logos are trademarks of their respective projects. Market data is provided by{' '}
            {ext(COINGECKO_URL, 'CoinGecko')}.
          </p>
        </>
      ),
    },
    {
      id: 'fonts',
      title: 'Fonts, icons and illustrations',
      body: (
        <ul>
          <li>
            Grenze Gotisch, Newsreader, Archivo and IBM Plex Mono fonts, licensed under the SIL Open Font License 1.1, served from our
            own server (no request to Google Fonts).
          </li>
          <li>Interface icons: SVGs drawn for the project. The Google logo is a trademark of Google LLC, used only to identify this sign-in service.</li>
          <li>Pixel-art portraits: illustrations created for the first version of Kryptonews.</li>
        </ul>
      ),
    },
    {
      id: 'liability',
      title: 'Liability and disclaimer',
      body: (
        <>
          <p>
            Published information (prices, changes, news) is provided for guidance only. It may be inaccurate, incomplete or delayed.
            The publisher cannot be held liable for direct or indirect damage resulting from its use, nor for the content of third-party
            sites reached through links.
          </p>
          <p>
            <strong>Kryptonews does not provide investment advice</strong>, personalised recommendations or any crypto-asset service.
            Crypto-assets are highly volatile: you can lose some or all of the capital invested.
          </p>
        </>
      ),
    },
    {
      id: 'law',
      title: 'Governing law',
      body: <p>This site and this notice are governed by French law.</p>,
    },
  ];
}

/* ═══════════════════════════════ Confidentialité / Privacy ═══════════════════════════════ */

function privacy(ctx: Ctx): LongformSection[] {
  if (ctx.locale === 'fr') {
    return [
      {
        id: 'en-bref',
        title: 'En bref',
        body: (
          <ul>
            <li>Aucune publicité, aucune mesure d&apos;audience, aucun cookie de pistage, aucune revente de données.</li>
            <li>
              Votre navigateur ne contacte aucun tiers : polices, logos et images d&apos;articles sont servis par notre propre serveur.
              Seule exception : la connexion avec Google, réservée à la rédaction.
            </li>
            <li>Un compte ne conserve que le strict nécessaire, et vous pouvez l&apos;exporter ou le supprimer à tout moment.</li>
          </ul>
        ),
      },
      {
        id: 'responsable',
        title: 'Responsable du traitement',
        body: (
          <p>
            Maxence Bonnici, éditeur du site (voir les <a href={ctx.links.legalNotice}>mentions légales</a>). Contact : <Contact ctx={ctx} />.
          </p>
        ),
      },
      {
        id: 'donnees',
        title: 'Données traitées',
        body: (
          <>
            <p>
              Sans compte, vous pouvez lire l&apos;édition gratuite sans fournir aucune donnée personnelle. Le mode invité (démonstration
              avec des données fictives) ne collecte rien non plus : ce que vous y faites reste dans votre navigateur.
            </p>
            <table>
              <thead>
                <tr>
                  <th scope="col">Traitement</th>
                  <th scope="col">Données</th>
                  <th scope="col">Base légale</th>
                  <th scope="col">Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Demande d&apos;accès</td>
                  <td>Prénom, nom, adresse e-mail, langue, date de la demande</td>
                  <td>Mesures précontractuelles à votre demande (art. 6.1.b RGPD)</td>
                  <td>
                    Jusqu&apos;à la réponse de la rédaction (la demande est alors supprimée), 30 jours au plus. Si elle est acceptée, seuls
                    l&apos;e-mail et un nom d&apos;utilisateur tiré du prénom et du nom sont repris dans le compte.
                  </td>
                </tr>
                <tr>
                  <td>Compte lecteur</td>
                  <td>
                    Nom d&apos;utilisateur, adresse e-mail, mot de passe (haché avec bcrypt, jamais stocké en clair), portrait choisi,
                    langue, rôle, dates d&apos;inscription et de dernière connexion
                  </td>
                  <td>Exécution des conditions d&apos;utilisation (art. 6.1.b RGPD)</td>
                  <td>Jusqu&apos;à la suppression du compte ; suppression automatique après 3 ans sans connexion</td>
                </tr>
                <tr>
                  <td>Connexion Google (rédaction uniquement)</td>
                  <td>Identifiant Google, prénom, adresse e-mail vérifiée</td>
                  <td>Intérêt légitime : sécuriser l&apos;accès à la salle de rédaction</td>
                  <td>Comme le compte</td>
                </tr>
                <tr>
                  <td>Notifications (facultatives)</td>
                  <td>
                    Adresse d&apos;abonnement fournie par le service de notifications de votre navigateur, clés de chiffrement, types de
                    notifications choisis, langue ; lien avec votre compte si vous êtes connecté
                  </td>
                  <td>Consentement (art. 6.1.a RGPD), retirable à tout moment depuis la cloche</td>
                  <td>Jusqu&apos;à la désactivation, ou suppression automatique quand le navigateur révoque l&apos;abonnement</td>
                </tr>
                <tr>
                  <td>Échanges par e-mail (retours, mot de passe oublié)</td>
                  <td>Adresse e-mail et contenu du message</td>
                  <td>Intérêt légitime : répondre à votre demande</td>
                  <td>Le temps du traitement, 12 mois au plus</td>
                </tr>
                <tr>
                  <td>Coupures et cryptos suivies</td>
                  <td>Références des articles et cryptos enregistrés, titre, date d&apos;enregistrement</td>
                  <td>Exécution des conditions d&apos;utilisation</td>
                  <td>Jusqu&apos;à leur retrait ou la suppression du compte</td>
                </tr>
                <tr>
                  <td>Sécurité</td>
                  <td>
                    Adresse IP, conservée uniquement en mémoire pour limiter les tentatives de connexion et de demande d&apos;accès ; petit
                    calcul anti-robot effectué par votre navigateur (aucun service tiers, aucun cookie)
                  </td>
                  <td>Intérêt légitime : prévenir les abus (art. 6.1.f RGPD)</td>
                  <td>15 minutes à 24 heures, jamais écrite sur disque</td>
                </tr>
              </tbody>
            </table>
            <p>
              L&apos;application n&apos;enregistre pas les adresses IP dans ses journaux. Les journaux techniques (erreurs, état des tâches
              planifiées) ne contiennent pas de données personnelles.
            </p>
          </>
        ),
      },
      {
        id: 'cookies',
        title: 'Cookies et stockage local',
        body: (
          <>
            <table>
              <thead>
                <tr>
                  <th scope="col">Nom</th>
                  <th scope="col">Rôle</th>
                  <th scope="col">Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>kn_session</td>
                  <td>Cookie HTTP-only : maintient votre session une fois connecté, ou la session de démonstration du mode invité</td>
                  <td>7 jours (24 heures en mode invité)</td>
                </tr>
                <tr>
                  <td>kn_oauth</td>
                  <td>Protège la connexion Google de la rédaction contre la falsification de requête (créé uniquement à ce moment-là)</td>
                  <td>10 minutes</td>
                </tr>
                <tr>
                  <td>kn_locale</td>
                  <td>Mémorise la langue que vous avez choisie</td>
                  <td>1 an</td>
                </tr>
                <tr>
                  <td>kn_currency</td>
                  <td>Mémorise la devise d&apos;affichage que vous avez choisie</td>
                  <td>1 an</td>
                </tr>
                <tr>
                  <td>kn-guest-v1 (stockage local)</td>
                  <td>Mode invité : vos coupures, cryptos suivies et portrait de démonstration, conservés dans ce navigateur uniquement (jamais envoyés à nos serveurs, importés dans votre compte si vous en créez un)</td>
                  <td>Jusqu&apos;à effacement depuis la page compte ou par votre navigateur</td>
                </tr>
                <tr>
                  <td>kn-theme (stockage local)</td>
                  <td>Mémorise l&apos;édition du jour ou du soir (thème)</td>
                  <td>Jusqu&apos;à effacement par votre navigateur</td>
                </tr>
              </tbody>
            </table>
            <p>
              Cloudflare peut également déposer un cookie technique de sécurité (par exemple <code>__cf_bm</code>, 30 minutes) pour
              distinguer les robots malveillants.
            </p>
            <p>
              Tous ces traceurs sont strictement nécessaires au service ou mémorisent un choix que vous avez fait : ils sont exemptés de
              consentement (article 82 de la loi Informatique et Libertés, lignes directrices de la CNIL). C&apos;est pourquoi le site
              n&apos;affiche pas de bandeau cookies.
            </p>
          </>
        ),
      },
      {
        id: 'destinataires',
        title: 'Destinataires et sous-traitants',
        body: (
          <ul>
            <li>Vos données ne sont accessibles qu&apos;à l&apos;éditeur. Elles ne sont ni vendues, ni louées, ni partagées.</li>
            <li>
              <strong>Cloudflare, Inc.</strong> achemine le trafic (DNS, protection, cache) en tant que sous-traitant. Les transferts vers
              les États-Unis reposent sur le Data Privacy Framework UE–États-Unis et les clauses contractuelles types.
            </li>
            <li>
              <strong>Google</strong> (Google Ireland Limited), uniquement pour la connexion des membres de la rédaction ; Google agit
              comme responsable de traitement distinct, selon sa propre politique de confidentialité.
            </li>
            <li>
              Les <strong>services de notifications des navigateurs</strong> (Google, Mozilla, Apple, Microsoft), si vous activez les
              notifications : ils acheminent des messages chiffrés de bout en bout qu&apos;ils ne peuvent pas lire.
            </li>
            <li>
              CoinGecko et les éditeurs de presse sont interrogés par notre serveur, jamais par votre navigateur, et ne reçoivent aucune
              donnée vous concernant.
            </li>
          </ul>
        ),
      },
      {
        id: 'securite',
        title: 'Sécurité',
        body: (
          <p>
            HTTPS de bout en bout, mots de passe hachés avec bcrypt, cookie de session HTTP-only et SameSite, limitation des tentatives
            de connexion, demandes d&apos;accès examinées à la main et protégées contre les robots, politique de sécurité du contenu (CSP) stricte, base de données non exposée sur Internet et serveur situé en
            France.
          </p>
        ),
      },
      {
        id: 'droits',
        title: 'Vos droits',
        body: (
          <>
            <p>
              Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de
              portabilité, ainsi que du droit de définir des directives sur le sort de vos données après votre décès. La plupart de ces
              droits s&apos;exercent directement depuis <a href={ctx.links.account}>votre compte</a> : modifier vos informations,
              télécharger vos données au format JSON ou supprimer définitivement votre compte.
            </p>
            <p>
              Pour toute autre demande : <Contact ctx={ctx} />. Une réponse vous sera apportée sous un mois. Vous pouvez aussi adresser
              une réclamation à la CNIL ({ext('https://www.cnil.fr', 'cnil.fr')}, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07).
            </p>
          </>
        ),
      },
      {
        id: 'mineurs',
        title: 'Mineurs',
        body: <p>La création d&apos;un compte est réservée aux personnes âgées d&apos;au moins 15 ans.</p>,
      },
      {
        id: 'modifications',
        title: 'Modifications',
        body: (
          <p>
            Cette politique peut évoluer avec le service. La date de dernière mise à jour figure en bas de page ; les changements
            importants sont signalés dans le journal des versions du projet.
          </p>
        ),
      },
    ];
  }
  return [
    {
      id: 'summary',
      title: 'In short',
      body: (
        <ul>
          <li>No ads, no analytics, no tracking cookies, no data resale.</li>
          <li>
            Your browser never contacts third parties: fonts, logos and article images are served by our own server. The only exception
            is the Google sign-in reserved for editors.
          </li>
          <li>An account only stores what is strictly needed, and you can export or delete it at any time.</li>
        </ul>
      ),
    },
    {
      id: 'controller',
      title: 'Data controller',
      body: (
        <p>
          Maxence Bonnici, publisher of the site (see the <a href={ctx.links.legalNotice}>legal notice</a>). Contact: <Contact ctx={ctx} />.
        </p>
      ),
    },
    {
      id: 'data',
      title: 'Data we process',
      body: (
        <>
          <p>
            Without an account, you can read the free edition without providing any personal data. Guest mode (a demo with fictional
            data) collects nothing either: what you do there stays in your browser.
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">Processing</th>
                <th scope="col">Data</th>
                <th scope="col">Legal basis</th>
                <th scope="col">Retention</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Access request</td>
                <td>First name, last name, email address, language, date of the request</td>
                <td>Steps taken at your request before an agreement (GDPR art. 6.1.b)</td>
                <td>
                  Until the editors answer (the request is then deleted), 30 days at most. If approved, only the email and a username derived
                  from your names are kept in the account.
                </td>
              </tr>
              <tr>
                <td>Reader account</td>
                <td>
                  Username, email address, password (hashed with bcrypt, never stored in clear), chosen portrait, language, role, sign-up
                  and last login dates
                </td>
                <td>Performance of the terms of use (GDPR art. 6.1.b)</td>
                <td>Until the account is deleted; automatic deletion after 3 years without login</td>
              </tr>
              <tr>
                <td>Google sign-in (editors only)</td>
                <td>Google ID, first name, verified email address</td>
                <td>Legitimate interest: securing access to the editor&apos;s desk</td>
                <td>Same as the account</td>
              </tr>
              <tr>
                <td>Notifications (optional)</td>
                <td>Subscription address provided by your browser&apos;s notification service, encryption keys, chosen notification types, language; link to your account if signed in</td>
                <td>Consent (GDPR art. 6.1.a), withdrawable at any time from the bell</td>
                <td>Until turned off, or deleted automatically when the browser revokes the subscription</td>
              </tr>
              <tr>
                <td>Email exchanges (feedback, forgotten password)</td>
                <td>Email address and message content</td>
                <td>Legitimate interest: answering your request</td>
                <td>For as long as needed, 12 months at most</td>
              </tr>
              <tr>
                <td>Clippings and watched coins</td>
                <td>References of saved articles and coins, title, date saved</td>
                <td>Performance of the terms of use</td>
                <td>Until removed or the account is deleted</td>
              </tr>
              <tr>
                <td>Security</td>
                <td>
                  IP address, kept in memory only to rate-limit login attempts and access requests; a small anti-robot calculation run by
                  your browser (no third-party service, no cookie)
                </td>
                <td>Legitimate interest: preventing abuse (GDPR art. 6.1.f)</td>
                <td>15 minutes to 24 hours, never written to disk</td>
              </tr>
            </tbody>
          </table>
          <p>The application does not record IP addresses in its logs. Technical logs (errors, scheduled job status) contain no personal data.</p>
        </>
      ),
    },
    {
      id: 'cookies',
      title: 'Cookies and local storage',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Purpose</th>
                <th scope="col">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>kn_session</td>
                <td>HTTP-only cookie: keeps you signed in, or keeps the guest-mode demo session</td>
                <td>7 days (24 hours in guest mode)</td>
              </tr>
              <tr>
                <td>kn_oauth</td>
                <td>Protects the editors&apos; Google sign-in against request forgery (only created at that moment)</td>
                <td>10 minutes</td>
              </tr>
              <tr>
                <td>kn_locale</td>
                <td>Remembers the language you chose</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>kn_currency</td>
                <td>Remembers the display currency you chose</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>kn-guest-v1 (local storage)</td>
                <td>Guest mode: your clippings, watched coins and demo portrait, kept in this browser only (never sent to our servers, imported into your account if you create one)</td>
                <td>Until erased from the account page or by your browser</td>
              </tr>
              <tr>
                <td>kn-theme (local storage)</td>
                <td>Remembers the day or night edition (theme)</td>
                <td>Until your browser clears it</td>
              </tr>
            </tbody>
          </table>
          <p>
            Cloudflare may also set a technical security cookie (for example <code>__cf_bm</code>, 30 minutes) to tell malicious bots
            apart.
          </p>
          <p>
            All of these are strictly necessary for the service or remember a choice you made, so they are exempt from consent under
            French law (article 82 of the Data Protection Act, CNIL guidelines). That is why the site shows no cookie banner.
          </p>
        </>
      ),
    },
    {
      id: 'recipients',
      title: 'Recipients and processors',
      body: (
        <ul>
          <li>Your data is only accessible to the publisher. It is never sold, rented or shared.</li>
          <li>
            <strong>Cloudflare, Inc.</strong> routes traffic (DNS, protection, caching) as a processor. Transfers to the United States
            rely on the EU–US Data Privacy Framework and standard contractual clauses.
          </li>
          <li>
            <strong>Google</strong> (Google Ireland Limited), only for editors signing in; Google acts as a separate controller under its
            own privacy policy.
          </li>
          <li>
            <strong>Browser notification services</strong> (Google, Mozilla, Apple, Microsoft), if you turn notifications on: they deliver
            end-to-end encrypted messages that they cannot read.
          </li>
          <li>CoinGecko and news publishers are queried by our server, never by your browser, and receive no data about you.</li>
        </ul>
      ),
    },
    {
      id: 'security',
      title: 'Security',
      body: (
        <p>
          End-to-end HTTPS, passwords hashed with bcrypt, HTTP-only SameSite session cookie, login rate limiting, access requests
          reviewed by hand and protected against bots, a strict Content
          Security Policy, a database that is not exposed to the Internet, and a server located in France.
        </p>
      ),
    },
    {
      id: 'rights',
      title: 'Your rights',
      body: (
        <>
          <p>
            You have the right to access, rectify, erase, restrict, object to and port your data, and to set instructions for what
            happens to it after your death. Most of these rights can be exercised directly from <a href={ctx.links.account}>your account</a>:
            edit your details, download your data as JSON, or permanently delete your account.
          </p>
          <p>
            For any other request: <Contact ctx={ctx} />. You will get an answer within one month. You can also lodge a complaint with the
            French data protection authority, the CNIL ({ext('https://www.cnil.fr', 'cnil.fr')}).
          </p>
        </>
      ),
    },
    {
      id: 'minors',
      title: 'Minors',
      body: <p>Creating an account is reserved for people aged 15 or over.</p>,
    },
    {
      id: 'changes',
      title: 'Changes',
      body: <p>This policy may evolve with the service. The last update date is shown at the bottom of the page; significant changes are listed in the project changelog.</p>,
    },
  ];
}

/* ═══════════════════════════════ CGU / Terms ═══════════════════════════════ */

function terms(ctx: Ctx): LongformSection[] {
  if (ctx.locale === 'fr') {
    return [
      {
        id: 'objet',
        title: 'Objet',
        body: (
          <p>
            Les présentes conditions encadrent l&apos;utilisation de Kryptonews, journal crypto en ligne gratuit édité par Maxence
            Bonnici. Naviguer sur le site vaut acceptation de ces conditions ; demander un compte nécessite de les accepter expressément.
          </p>
        ),
      },
      {
        id: 'service',
        title: 'Le service',
        body: (
          <ul>
            <li>L&apos;édition gratuite est accessible sans compte, avec un nombre limité de cryptos et de titres.</li>
            <li>
              Un compte gratuit donne accès à l&apos;ensemble du grand livre des marchés et des titres, aux coupures (articles enregistrés)
              et aux cryptos suivies.
            </li>
            <li>
              Les comptes sont ouverts sur demande : la rédaction examine chaque demande et peut la refuser sans avoir à se justifier.
              Les identifiants sont envoyés par e-mail avec un mot de passe temporaire, à remplacer dès la première connexion.
            </li>
            <li>Un mode invité permet d&apos;explorer les fonctions réservées aux comptes avec des données fictives ; ce que vous y faites est enregistré dans votre navigateur uniquement.</li>
            <li>Le service est gratuit, sans publicité et sans offre payante.</li>
          </ul>
        ),
      },
      {
        id: 'compte',
        title: 'Votre compte',
        body: (
          <ul>
            <li>Vous devez avoir au moins 15 ans et fournir des informations exactes.</li>
            <li>Vous êtes responsable de la confidentialité de votre mot de passe et des actions réalisées depuis votre compte.</li>
            <li>Un nom d&apos;utilisateur ne doit pas usurper l&apos;identité d&apos;un tiers ni être injurieux.</li>
            <li>Vous pouvez supprimer votre compte à tout moment depuis la page « Votre compte ».</li>
          </ul>
        ),
      },
      {
        id: 'usage',
        title: 'Utilisation acceptable',
        body: (
          <p>
            Il est interdit de perturber le fonctionnement du site, de tenter d&apos;accéder à des zones ou données non autorisées
            (notamment la salle de rédaction), de contourner les limites de l&apos;édition gratuite ou de collecter massivement ses
            contenus de manière automatisée. Des limitations de requêtes sont en place.
          </p>
        ),
      },
      {
        id: 'contenus',
        title: 'Contenus tiers',
        body: (
          <p>
            Les articles appartiennent à leurs éditeurs : Kryptonews n&apos;en affiche que le titre, un court extrait et un lien vers la
            source, qui obéit à ses propres conditions. Les données de marché proviennent de CoinGecko. L&apos;éditeur n&apos;est pas
            responsable du contenu des sites tiers.
          </p>
        ),
      },
      {
        id: 'conseil',
        title: 'Aucun conseil en investissement',
        body: (
          <p>
            Les informations publiées sont fournies à titre purement informatif et peuvent être inexactes ou différées. Elles ne
            constituent ni un conseil en investissement, ni une incitation à acheter ou vendre un actif. Les crypto-actifs sont très
            risqués : n&apos;investissez que ce que vous pouvez vous permettre de perdre.
          </p>
        ),
      },
      {
        id: 'disponibilite',
        title: 'Disponibilité',
        body: (
          <p>
            Le site est auto-hébergé et fourni « en l&apos;état ». L&apos;éditeur s&apos;efforce de le maintenir accessible mais ne garantit
            pas une disponibilité continue ; il peut l&apos;interrompre, notamment pour maintenance, ou faire évoluer ses fonctionnalités.
          </p>
        ),
      },
      {
        id: 'suspension',
        title: 'Suspension et suppression',
        body: (
          <p>
            En cas de manquement aux présentes conditions, l&apos;éditeur peut suspendre ou supprimer un compte. Les comptes inactifs
            depuis 3 ans sont supprimés automatiquement.
          </p>
        ),
      },
      {
        id: 'donnees',
        title: 'Données personnelles',
        body: (
          <p>
            Le traitement de vos données est décrit dans la <a href={ctx.links.privacy}>politique de confidentialité</a>.
          </p>
        ),
      },
      {
        id: 'evolution',
        title: 'Évolution des conditions',
        body: <p>Ces conditions peuvent être modifiées. La version applicable est celle publiée sur cette page à la date de votre visite.</p>,
      },
      {
        id: 'droit',
        title: 'Droit applicable',
        body: <p>Les présentes conditions sont soumises au droit français. En cas de litige, et à défaut de solution amiable, les tribunaux français sont compétents.</p>,
      },
    ];
  }
  return [
    {
      id: 'purpose',
      title: 'Purpose',
      body: (
        <p>
          These terms govern the use of Kryptonews, a free online crypto newspaper published by Maxence Bonnici. Browsing the site means
          you accept them; requesting an account requires accepting them explicitly.
        </p>
      ),
    },
    {
      id: 'service',
      title: 'The service',
      body: (
        <ul>
          <li>The free edition is available without an account, with a limited number of coins and headlines.</li>
          <li>A free account unlocks the whole market ledger and every headline, clippings (saved stories) and watched coins.</li>
          <li>
            Accounts are opened on request: the editors review each request and may decline it without giving a reason. Login details are
            emailed with a temporary password, to be replaced at the first login.
          </li>
          <li>Guest mode lets you explore the account features with fictional data; what you do there is saved in your browser only.</li>
          <li>The service is free, ad-free and has no paid tier.</li>
        </ul>
      ),
    },
    {
      id: 'account',
      title: 'Your account',
      body: (
        <ul>
          <li>You must be at least 15 years old and provide accurate information.</li>
          <li>You are responsible for keeping your password confidential and for what happens through your account.</li>
          <li>A username must not impersonate anyone or be offensive.</li>
          <li>You can delete your account at any time from the “Your account” page.</li>
        </ul>
      ),
    },
    {
      id: 'use',
      title: 'Acceptable use',
      body: (
        <p>
          You must not disrupt the site, try to reach areas or data you are not allowed to (including the editor&apos;s desk), circumvent
          the free edition limits, or scrape its content at scale. Rate limits are in place.
        </p>
      ),
    },
    {
      id: 'third-party',
      title: 'Third-party content',
      body: (
        <p>
          Articles belong to their publishers: Kryptonews only shows the title, a short excerpt and a link to the source, which has its
          own terms. Market data comes from CoinGecko. The publisher is not responsible for the content of third-party sites.
        </p>
      ),
    },
    {
      id: 'advice',
      title: 'No investment advice',
      body: (
        <p>
          Published information is for information purposes only and may be inaccurate or delayed. It is not investment advice nor an
          invitation to buy or sell any asset. Crypto-assets are very risky: only invest what you can afford to lose.
        </p>
      ),
    },
    {
      id: 'availability',
      title: 'Availability',
      body: (
        <p>
          The site is self-hosted and provided “as is”. The publisher tries to keep it available but does not guarantee continuous
          access; it may be interrupted, for example for maintenance, and its features may change.
        </p>
      ),
    },
    {
      id: 'termination',
      title: 'Suspension and deletion',
      body: <p>If these terms are breached, the publisher may suspend or delete an account. Accounts inactive for 3 years are deleted automatically.</p>,
    },
    {
      id: 'data',
      title: 'Personal data',
      body: (
        <p>
          How your data is processed is described in the <a href={ctx.links.privacy}>privacy policy</a>.
        </p>
      ),
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      body: <p>These terms may change. The applicable version is the one published on this page on the day of your visit.</p>,
    },
    {
      id: 'law',
      title: 'Governing law',
      body: <p>These terms are governed by French law. Failing an amicable solution, French courts have jurisdiction.</p>,
    },
  ];
}

/* ═══════════════════════════════ Accessibilité / Accessibility ═══════════════════════════════ */

function accessibility(ctx: Ctx): LongformSection[] {
  if (ctx.locale === 'fr') {
    return [
      {
        id: 'engagement',
        title: 'Engagement',
        body: (
          <p>
            Kryptonews s&apos;engage à rendre son site accessible à toutes et tous. En tant que projet personnel, le site n&apos;est pas
            soumis à l&apos;obligation légale de déclaration d&apos;accessibilité ; cette déclaration est publiée volontairement et
            s&apos;applique à <strong>{new URL(ctx.siteUrl).host}</strong>.
          </p>
        ),
      },
      {
        id: 'conformite',
        title: 'État de conformité',
        body: (
          <p>
            Kryptonews est <strong>partiellement conforme</strong> au RGAA 4.1.2 et aux WCAG 2.2 niveau AA. Aucune non-conformité
            n&apos;est connue à ce jour, mais aucun audit complet des 106 critères du RGAA n&apos;a été réalisé : la conformité totale ne
            peut donc pas être revendiquée.
          </p>
        ),
      },
      {
        id: 'tests',
        title: 'Résultats des tests',
        body: (
          <>
            <p>Il s&apos;agit d&apos;une auto-évaluation, pas d&apos;un audit par un tiers. Elle combine :</p>
            <ul>
              <li>
                des tests automatisés avec axe-core (règles WCAG 2.0, 2.1 et 2.2 A et AA) sur les pages publiques, dans les deux langues
                et les deux thèmes, sans erreur relevée lors de la publication de la version 2.1.0 ;
              </li>
              <li>le calcul des contrastes de chaque couleur de texte du thème : tous les textes atteignent au moins 4,5:1 ;</li>
              <li>la navigation complète au clavier, avec lien d&apos;évitement et focus visible ;</li>
              <li>l&apos;affichage à 200 % de zoom et sur une largeur de 320 px ;</li>
              <li>le respect de la préférence « réduire les animations ».</li>
            </ul>
            <p>Aucun taux de conformité RGAA n&apos;a été calculé. Aucun test approfondi avec lecteur d&apos;écran n&apos;a encore été mené.</p>
          </>
        ),
      },
      {
        id: 'contenus',
        title: 'Contenus et limites connues',
        body: (
          <ul>
            <li>
              Le graphique de prix est accompagné d&apos;un résumé textuel (valeurs de début, de fin, plus haut et plus bas) et chaque
              point est lisible au clavier avec les flèches.
            </li>
            <li>Le bandeau défilant des cours peut être mis en pause ; il est figé lorsque la réduction des animations est activée.</li>
            <li>Les logos des cryptos et les photos d&apos;articles sont décoratifs : le nom ou le titre figure toujours à côté.</li>
            <li>
              Les articles complets sont publiés sur les sites des éditeurs et la connexion Google de la rédaction se fait sur le site de Google :
              ces contenus tiers sont hors du périmètre de cette déclaration.
            </li>
          </ul>
        ),
      },
      {
        id: 'etablissement',
        title: 'Établissement de cette déclaration',
        body: (
          <ul>
            <li>Déclaration établie le 15 novembre 2026, mise à jour avec la version 2.1.0 du site.</li>
            <li>Technologies : HTML5, CSS, JavaScript, React / Next.js, SVG, WAI-ARIA.</li>
            <li>Environnement de test : Chromium récent, en affichage bureau et mobile.</li>
            <li>
              Pages évaluées : la une, le grand livre des marchés, une page crypto, la dépêche, connexion, inscription, à propos, pages
              légales et page d&apos;erreur.
            </li>
            <li>
              Le site respecte les réglages du système (thème clair ou sombre, réduction des animations), indique la langue de chaque
              article et annonce les changements de page aux lecteurs d&apos;écran.
            </li>
          </ul>
        ),
      },
      {
        id: 'contact',
        title: 'Retour d’information et contact',
        body: (
          <p>
            Si vous n&apos;arrivez pas à accéder à un contenu ou à un service, contactez <Contact ctx={ctx} /> pour obtenir une alternative
            accessible ou le contenu sous une autre forme.
          </p>
        ),
      },
      {
        id: 'recours',
        title: 'Voies de recours',
        body: (
          <>
            <p>
              Si vous avez signalé un défaut d&apos;accessibilité sans obtenir de réponse satisfaisante, vous pouvez saisir le Défenseur des
              droits :
            </p>
            <ul>
              <li>{ext('https://formulaire.defenseurdesdroits.fr/', 'via le formulaire en ligne')} ;</li>
              <li>{ext('https://www.defenseurdesdroits.fr/carte-des-delegues', 'en contactant un délégué de votre région')} ;</li>
              <li>par courrier gratuit, sans affranchissement : Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07.</li>
            </ul>
          </>
        ),
      },
    ];
  }
  return [
    {
      id: 'commitment',
      title: 'Commitment',
      body: (
        <p>
          Kryptonews is committed to making its website accessible to everyone. As a personal project it is not legally required to
          publish an accessibility statement; this statement is published voluntarily and applies to{' '}
          <strong>{new URL(ctx.siteUrl).host}</strong>.
        </p>
      ),
    },
    {
      id: 'status',
      title: 'Compliance status',
      body: (
        <p>
          Kryptonews is <strong>partially compliant</strong> with RGAA 4.1.2 (the French accessibility standard) and WCAG 2.2 level AA.
          No non-compliance is currently known, but no full audit of the 106 RGAA criteria has been carried out, so full compliance cannot
          be claimed.
        </p>
      ),
    },
    {
      id: 'tests',
      title: 'Test results',
      body: (
        <>
          <p>This is a self-assessment, not a third-party audit. It combines:</p>
          <ul>
            <li>
              automated tests with axe-core (WCAG 2.0, 2.1 and 2.2 A and AA rules) on the public pages, in both languages and both
              themes, with no violations found at the release of version 2.1.0;
            </li>
            <li>contrast calculations for every text colour of the theme: all text reaches at least 4.5:1;</li>
            <li>full keyboard navigation, with a skip link and a visible focus indicator;</li>
            <li>display at 200% zoom and at a width of 320 px;</li>
            <li>support for the “reduce motion” preference.</li>
          </ul>
          <p>No RGAA compliance rate has been calculated. No in-depth screen reader testing has been carried out yet.</p>
        </>
      ),
    },
    {
      id: 'content',
      title: 'Content and known limitations',
      body: (
        <ul>
          <li>
            The price chart comes with a text summary (start, end, high and low values) and every point can be read with the arrow keys.
          </li>
          <li>The price ticker can be paused; it stays still when reduced motion is enabled.</li>
          <li>Coin logos and article pictures are decorative: the name or headline is always next to them.</li>
          <li>
            Full articles are published on the publishers&apos; websites and the editors&apos; Google sign-in happens on Google&apos;s website: this
            third-party content is outside the scope of this statement.
          </li>
        </ul>
      ),
    },
    {
      id: 'preparation',
      title: 'Preparation of this statement',
      body: (
        <ul>
          <li>Statement drafted on 15 November 2026, updated with version 2.1.0 of the site.</li>
          <li>Technologies: HTML5, CSS, JavaScript, React / Next.js, SVG, WAI-ARIA.</li>
          <li>Test environment: recent Chromium, desktop and mobile viewports.</li>
          <li>Pages assessed: front page, market ledger, a coin page, the wire, log in, register, about, legal pages and the error page.</li>
          <li>
            The site follows system settings (light or dark theme, reduced motion), marks the language of each article and announces page
            changes to screen readers.
          </li>
        </ul>
      ),
    },
    {
      id: 'feedback',
      title: 'Feedback and contact',
      body: (
        <p>
          If you cannot access some content or a feature, contact <Contact ctx={ctx} /> to get an accessible alternative or the content in
          another format.
        </p>
      ),
    },
    {
      id: 'recourse',
      title: 'Recourse',
      body: (
        <>
          <p>If you reported an accessibility issue and did not get a satisfactory answer, you can contact the French Défenseur des droits:</p>
          <ul>
            <li>{ext('https://formulaire.defenseurdesdroits.fr/', 'through the online form')};</li>
            <li>{ext('https://www.defenseurdesdroits.fr/carte-des-delegues', 'through a delegate in your region')};</li>
            <li>by free post, no stamp needed: Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07, France.</li>
          </ul>
        </>
      ),
    },
  ];
}

export function getLegalSections(page: LegalPage, ctx: Ctx): LongformSection[] {
  switch (page) {
    case 'legal-notice':
      return legalNotice(ctx);
    case 'privacy':
      return privacy(ctx);
    case 'terms':
      return terms(ctx);
    case 'accessibility':
      return accessibility(ctx);
  }
}

export { AUTHOR_URL };
