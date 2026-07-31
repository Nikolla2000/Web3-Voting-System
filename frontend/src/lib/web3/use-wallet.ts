'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export const METAMASK_INSTALL_URL = 'https://metamask.io/download/';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();
  const [hasInjectedProvider, setHasInjectedProvider] = useState(false);

  useEffect(() => {
    setHasInjectedProvider(typeof window !== 'undefined' && Boolean(window.ethereum));
  }, []);

  const connectWallet = () => {
    const injectedConnector = connectors.find((connector) => connector.type === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  return { address, isConnected, disconnect, connectWallet, hasInjectedProvider };
}