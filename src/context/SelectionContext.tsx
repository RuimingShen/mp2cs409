import React, { createContext, useContext, useMemo, useState } from 'react';


interface SelectionContextValue {
order: string[]; // ordered list of ids or names used by DetailView for prev/next
setOrder: (order: string[]) => void;
}


const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);


export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const [order, setOrder] = useState<string[]>([]);
const value = useMemo(() => ({ order, setOrder }), [order]);
return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};


export const useSelection = () => {
const ctx = useContext(SelectionContext);
if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
return ctx;
};
