import React, { useState } from 'react';

const DefaultMark: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 52 52"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M45.5 10.0883L26 2L6.5 10.0883V23.5117C6.5 35.845 26 49.0017 26 49.0017C26 49.0017 45.5 35.845 45.5 23.5117V10.0883Z"
      className="stroke-blue-500"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M26.0002 30.1667L18.3335 22.5L24.0585 19.6417L27.9418 15.7583L30.8002 21.4833L33.6668 27.25L26.0002 30.1667Z"
      className="fill-white"
    />
  </svg>
);

const Logo: React.FC = () => {
  const [imgError, setImgError] = useState(false);
  const size = 40;

  return (
    <div className="flex items-center">
      {imgError ? (
        <DefaultMark size={size} />
      ) : (
        <img
          src="https://i.imgur.com/ubUMLy0.png"
          alt="Jet Wallet"
          width={size}
          height={size}
          className="h-10 w-10"
          loading="eager"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      )}
      <div className="ml-3">
        <span className="text-white text-xl font-bold tracking-wider">JET</span>
        <span className="block text-white text-xl font-bold tracking-wider -mt-1">WALLET</span>
      </div>
    </div>
  );
};

export default Logo;
