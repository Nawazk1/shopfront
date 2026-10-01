'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { Product } from '@/lib/catalogueStore';

interface ProductPreviewProps {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
}

export default function ProductPreview({ product, onClose, onEdit }: ProductPreviewProps) {
  const mainImage = product.images.find(img => img.isMain) || product.images[0];
  const [activeImg, setActiveImg] = React.useState(mainImage?.url || '');

  React.useEffect(() => {
    const main = product.images.find(img => img.isMain) || product.images[0];
    setActiveImg(main?.url || '');
  }, [product]);

  const statusColors = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
  };

  const stockColors = {
    in_stock: 'text-green-600',
    low_stock: 'text-orange-500',
    out_of_stock: 'text-red-600',
  };

  const stockLabels = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              <Icon name="PencilSquareIcon" size={15} />
              Edit
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Icon name="XMarkIcon" size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Images */}
            <div>
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                {activeImg ? (
                  <img src={activeImg} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="PhotoIcon" size={48} className="text-gray-300" />
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map(img => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImg(img.url)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === img.url ? 'border-primary' : 'border-gray-200'}`}
                    >
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h3>
                <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[product.status]}`}>
                  {product.status}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-gray-900">₹{product.sellingPrice.toLocaleString()}</span>
                {product.mrp > product.sellingPrice && (
                  <>
                    <span className="text-gray-400 line-through text-sm">₹{product.mrp.toLocaleString()}</span>
                    <span className="text-green-600 text-sm font-semibold">{product.discount}% off</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">SKU</p>
                  <p className="font-semibold text-gray-900">{product.sku}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Category</p>
                  <p className="font-semibold text-gray-900">{product.category}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Stock</p>
                  <p className={`font-semibold ${stockColors[product.stockStatus]}`}>
                    {product.stockQuantity} units · {stockLabels[product.stockStatus]}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Brand</p>
                  <p className="font-semibold text-gray-900">{product.brand || '—'}</p>
                </div>
              </div>

              {product.shortDescription && (
                <p className="text-sm text-gray-600 leading-relaxed">{product.shortDescription}</p>
              )}

              {(product.color || product.size || product.material) && (
                <div className="space-y-2 text-sm">
                  {product.color && <div className="flex gap-2"><span className="text-gray-500 w-20">Color:</span><span className="font-medium">{product.color}</span></div>}
                  {product.size && <div className="flex gap-2"><span className="text-gray-500 w-20">Size:</span><span className="font-medium">{product.size}</span></div>}
                  {product.material && <div className="flex gap-2"><span className="text-gray-500 w-20">Material:</span><span className="font-medium">{product.material}</span></div>}
                  {product.weight && <div className="flex gap-2"><span className="text-gray-500 w-20">Weight:</span><span className="font-medium">{product.weight}</span></div>}
                </div>
              )}

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {product.fullDescription && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-2">Full Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{product.fullDescription}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
