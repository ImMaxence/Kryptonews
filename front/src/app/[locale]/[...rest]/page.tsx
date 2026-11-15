import { notFound } from 'next/navigation';

/** Any unknown path under a locale renders the localized "Stop the presses!" page. */
export default function CatchAll() {
  notFound();
}
