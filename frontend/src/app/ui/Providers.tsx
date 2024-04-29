'use client'

import { ReactNode } from "react";
import { SessionProvider } from 'next-auth/react';
import { MetamaskProvider } from "./MetamaskProvider";

interface Props {
  children: ReactNode;
}

const Providers = ({ children }: Props ) => {
  return (
      <SessionProvider>
        <MetamaskProvider>
          {children}
        </MetamaskProvider>
      </SessionProvider>
  )
}

export default Providers;