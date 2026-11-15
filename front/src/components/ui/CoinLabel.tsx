import { Link } from '@/i18n/navigation';

/** Coin icon + linked name + ticker symbol. The icon is decorative (name is right next to it). */
export function CoinLabel({ id, name, symbol, image, link = true }: { id: string; name: string; symbol: string; image: string | null; link?: boolean }) {
  return (
    <span className="coin">
      {image ? (
        <img className="coin__icon" src={image} alt="" width={28} height={28} loading="lazy" decoding="async" />
      ) : (
        <span className="coin__icon" aria-hidden="true" />
      )}
      <span>
        {link ? (
          <Link className="coin__name marker-link" href={{ pathname: '/markets/[id]', params: { id } }} prefetch={false}>
            {name}
          </Link>
        ) : (
          <span className="coin__name">{name}</span>
        )}
        <span className="coin__symbol">{symbol}</span>
      </span>
    </span>
  );
}
