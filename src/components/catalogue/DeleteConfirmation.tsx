'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface DeleteConfirmationProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({ productName, onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-4">
          <Icon name="TrashIcon" size={28} className="text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Product</h3>
        <p className="text-gray-600 text-center mb-1">Are you sure you want to delete this product?</p>
        <p className="text-gray-900 font-semibold text-center mb-6 truncate px-4">"{productName}"</p>
        <p className="text-sm text-red-600 text-center mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
