'use client'

import { height } from '@mui/system';
import { TypeAnimation } from 'react-type-animation';

export default function TypewriterEffect() {
  return (
    <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed out once, initially
        'The Future of the Web',
        1000, // wait 1s before replacing "Mice" with "Hamsters"
        'Decentralized and Secure',
        1000,
        'We produce food for Guinea Pigs',
        1000,
        'Transparent and Trustworthy',
        1000
      ]}
      wrapper="span"
      speed={50}
      repeat={Infinity}
    />
  );
};