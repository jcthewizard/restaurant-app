import React from 'react';
import { PriceRange } from '../../types';

interface PriceRangeFilterProps {
  selectedRange: PriceRange;
  onChange: (range: PriceRange) => void;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({ selectedRange, onChange }) => {
  const priceRanges: PriceRange[] = ['$', '$$', '$$$'];
  
  return (
    <div className="flex flex-col space-y-2">
      <h3 className="font-medium text-gray-700">Price Range</h3>
      <div className="flex space-x-2">
        {priceRanges.map((range) => (
          <button
            key={range}
            onClick={() => onChange(range)}
            className={`px-4 py-2 rounded-full ${
              selectedRange === range
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriceRangeFilter;