import React from 'react';
import FoodCard from './FoodCard';

export const FoodGrid = ({ foods = [] }) => {
  if (!foods || foods.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {foods.map((food) => (
        <FoodCard key={food._id || food.id} food={food} />
      ))}
    </div>
  );
};

export default FoodGrid;
