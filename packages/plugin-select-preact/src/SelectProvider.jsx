// eslint-disable-next-line no-unused-vars
import { h, createContext } from 'preact';

export const SelectContext = createContext(null);

export function SelectProvider({ widget, children }) {
  return (
    <SelectContext.Provider value={widget}>{children}</SelectContext.Provider>
  );
}
