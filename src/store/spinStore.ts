import { create } from 'zustand';
import { Offer, PriceRange, Spin } from '../types';
import { getRandomOffer } from '../data/mockData';
import { format } from 'date-fns';

interface SpinState {
  currentSpin: Spin | null;
  spinHistory: Spin[];
  isSpinning: boolean;
  spinWheel: (userId: string, priceRange: PriceRange) => Promise<Spin>;
}

const useSpinStore = create<SpinState>((set, get) => ({
  currentSpin: null,
  spinHistory: [],
  isSpinning: false,
  spinWheel: async (userId: string, priceRange: PriceRange) => {
    // Set spinning state
    set({ isSpinning: true });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get random offer based on price range
    const offerResult = getRandomOffer(priceRange);
    
    // Create new spin result
    const newSpin: Spin = {
      id: `spin-${Date.now()}`,
      userId,
      priceRange,
      offerResult,
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };
    
    // Update state with new spin
    set(state => ({
      currentSpin: newSpin,
      spinHistory: [newSpin, ...state.spinHistory],
      isSpinning: false
    }));
    
    return newSpin;
  }
}));

export default useSpinStore;