import React, { useState } from "react";
import { CoinID } from "../types";
import { COINS } from "../constants";

type Props = {
  coinId: CoinID;
  className?: string;
  size?: number;
  alt?: string;
};

const SYMBOLS: Record<CoinID, string> = {
  [CoinID.BTC]: "btc",
  [CoinID.ETH]: "eth",
  [CoinID.XRP]: "xrp",
  [CoinID.USDT]: "usdt",
  [CoinID.SOL]: "sol",
  [CoinID.DOGE]: "doge",
};

// Source: Cryptocurrency Icons by spothq (PNG, public CDN on GitHub)
// 128px color icons: https://github.com/spothq/cryptocurrency-icons
const buildIconUrl = (id: CoinID) =>
  `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${SYMBOLS[id]}.png`;

const CoinLogo: React.FC<Props> = ({ coinId, className = "", size = 24, alt }) => {
  const [errored, setErrored] = useState(false);

  if (errored) {
    // Fallback to existing inline SVG from constants to guarantee a logo.
    const Svg = COINS[coinId].icon;
    return <Svg className={className} width={size} height={size} />;
  }

  return (
    <img
      src={buildIconUrl(coinId)}
      alt={alt ?? coinId}
      width={size}
      height={size}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
    />
  );
};

export default CoinLogo;
