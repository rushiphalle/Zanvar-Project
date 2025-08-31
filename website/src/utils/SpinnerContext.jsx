import { createContext, useContext, useState, useEffect } from "react";

const SpinnerContext = createContext();

export function SpinnerProvider({ children }) {
  const [spinner, setSpinner] = useState(null);

  return (
    <SpinnerContext.Provider value={{ spinner, setSpinner }}>
      {children}
    </SpinnerContext.Provider>
  );
}

export const useSpinner = () => useContext(SpinnerContext);
