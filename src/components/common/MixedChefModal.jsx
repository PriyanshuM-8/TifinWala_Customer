import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const MixedChefModal = () => {
  const { conflictModal, closeConflictModal, resolveConflictAndAdd, loading } = useCart();

  if (!conflictModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#E8ECE7] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeConflictModal}
          className="absolute top-4 right-4 p-1 rounded-full text-[#737B76] hover:bg-[#F7F8F5] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F6A23A] border border-amber-200 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-[#27352F]">
          Different Home Kitchen
        </h3>

        <p className="mt-2 text-sm text-[#737B76] leading-relaxed">
          Your cart currently has dishes from <strong className="text-[#27352F]">{conflictModal.existingKitchen}</strong>.
          To ensure hygienic, fresh preparation, each order must come from a single home chef.
        </p>

        <div className="mt-4 p-3 rounded-xl bg-[#F7F8F5] border border-[#E8ECE7] text-xs text-[#27352F]">
          Would you like to clear your current cart and start an order from <strong className="text-[#14513F]">{conflictModal.newKitchen}</strong> instead?
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={closeConflictModal}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8ECE7] text-sm font-semibold text-[#27352F] hover:bg-[#F7F8F5] transition-colors"
          >
            Keep Current Cart
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={resolveConflictAndAdd}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#14513F] text-white text-sm font-semibold hover:bg-[#0E3B2E] transition-colors shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-[#F6A23A]" />
            <span>{loading ? 'Updating...' : 'Clear & Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MixedChefModal;
