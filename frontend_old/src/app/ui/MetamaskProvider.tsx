import { ReactNode, createContext, useContext, useState } from "react";

interface MetamaskContextType {
  connectedAccount: string | null;
  setConnectedAccount: (value: string | null) => void;
}

const MetamaskContext = createContext<MetamaskContextType>({ 
  connectedAccount: null, 
  setConnectedAccount: () => {} 
});

export const useMetamask = () => useContext(MetamaskContext);

export const MetamaskProvider = ({ children } : { children: ReactNode }) => {
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);

  return (
    <MetamaskContext.Provider value={{ connectedAccount, setConnectedAccount }}>
      {children}
    </MetamaskContext.Provider>
  )
}