'use client'

import { TypewriterEffectProps } from '@/app/_types/types';
import React from 'react';
import { TypeAnimation } from 'react-type-animation';

export const TypewriterEffect : React.FC<TypewriterEffectProps> = ({ strings }) => {
  return (
    <TypeAnimation
      sequence={strings}
      wrapper="span"
      speed={50}
      repeat={Infinity}
    />
  );
};