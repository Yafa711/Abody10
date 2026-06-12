import React, { createContext, useContext, useState } from 'react';

interface LayoutAnimValue {
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl: string;
}

interface LayoutAnimationContextType {
  selectedProduct: LayoutAnimValue | null;
  setSelectedProduct: (val: LayoutAnimValue | null) => void;
}

const LayoutAnimationContext = createContext<LayoutAnimationContextType>({
  selectedProduct: null,
  setSelectedProduct: () => {},
});

export function LayoutAnimationProvider({ children }: { children: React.ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<LayoutAnimValue | null>(null);
  return (
    <LayoutAnimationContext.Provider value={{ selectedProduct, setSelectedProduct }}>
      {children}
    </LayoutAnimationContext.Provider>
  );
}

export function useLayoutAnimation() {
  return useContext(LayoutAnimationContext);
}
