'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import ImageUploader from './ImageUploader';
import { Product, ProductFormData, ProductImage, CATEGORIES, SUB_CATEGORIES } from '@/lib/catalogueStore';

interface ProductFormProps {
  product?: Product | null;
  onSave: (data: ProductFormData, status: 'published' | 'draft') => Promise<void>;
  onCancel: () => void;
}

const emptyForm: ProductFormData = {
  name: '', sku: '', shortDescription: '', fullDescription: '',
  category: '', subCategory: '', brand: '',
  sellingPrice: 0, mrp: 0, discount: 0, taxGst: 0,
  stockQuantity: 1, stockStatus: 'in_stock', minimumOrderQuantity: 1,
  images: [],
  color: '', size: '', material: '', weight: '', dimensions: '', tags: [],
  metaTitle: '', metaDescription: '', urlSlug: '',
  status: 'draft',
};

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [tagInput, setTagInput] = useState('');
  const [activeSection, setActiveSection] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (product) {
      const { id, createdAt, updatedAt, ...rest } = product;
      setForm(rest);
    } else {
      setForm(emptyForm);
    }
  }, [product]);

  const set = (field: keyof ProductFormData, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'sellingPrice' || field === 'mrp') {
        const sp = field === 'sellingPrice' ? Number(value) : Number(prev.sellingPrice);
        const mrp = field === 'mrp' ? Number(value) : Number(prev.mrp);
        if (mrp > 0 && sp <= mrp) {
          updated.discount = Math.round(((mrp - sp) / mrp) * 100);
        }
      }
      if (field === 'name' && !product) {
        updated.urlSlug = (value as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        updated.metaTitle = value as string;
      }
      if (field === 'category') {
        updated.subCategory = '';
      }
      if (field === 'stockQuantity') {
        const quantity = Number(value);
        updated.stockStatus = quantity === 0 ? 'out_of_stock' : quantity <= 10 ? 'low_stock' : 'in_stock';
      }
      return updated;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.sku.trim()) newErrors.sku = 'SKU is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (form.sellingPrice <= 0) newErrors.sellingPrice = 'Selling price must be greater than 0';
    if (form.mrp < form.sellingPrice) newErrors.mrp = 'MRP must be ≥ selling price';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'published' | 'draft') => {
    if (!validate()) {
      setActiveSection('basic');
      return;
    }
    setIsSaving(true);
    setSaveError('');
    try {
      await onSave({ ...form, status }, status);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Product could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      set('tags', [...form.tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => set('tags', form.tags.filter(t => t !== tag));

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: 'InformationCircleIcon' },
    { id: 'pricing', label: 'Pricing', icon: 'CurrencyRupeeIcon' },
    { id: 'inventory', label: 'Inventory', icon: 'ArchiveBoxIcon' },
    { id: 'images', label: 'Images', icon: 'PhotoIcon' },
    { id: 'details', label: 'Details', icon: 'TagIcon' },
    { id: 'seo', label: 'SEO', icon: 'MagnifyingGlassIcon' },
  ];

  const inputClass = (field?: keyof ProductFormData) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${
      field && errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
    }`;

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{product ? 'Update product information' : 'Fill in the details to add a new product'}</p>
          </div>
          <button onClick={onCancel} disabled={isSaving} aria-label="Close product form" className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
            <Icon name="XMarkIcon" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 px-6 gap-1 scrollbar-hide">
          {sections.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === s.id
                  ? 'border-primary text-primary' :'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon name={s.icon} size={15} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {saveError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</p>}
          {/* Basic Information */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Product Name <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inputClass('name')} placeholder="Enter product name" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className={labelClass}>SKU <span className="text-red-500">*</span></label>
                  <input type="text" value={form.sku} onChange={e => set('sku', e.target.value)} className={inputClass('sku')} placeholder="e.g. TSH-001" />
                  {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                </div>
              </div>
              <div>
                <label className={labelClass}>Short Description</label>
                <input type="text" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} className={inputClass()} placeholder="Brief product description" maxLength={160} />
              </div>
              <div>
                <label className={labelClass}>Full Description</label>
                <textarea value={form.fullDescription} onChange={e => set('fullDescription', e.target.value)} className={inputClass()} rows={4} placeholder="Detailed product description..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Category <span className="text-red-500">*</span></label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} className={inputClass('category')}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>
                <div>
                  <label className={labelClass}>Sub Category</label>
                  <select value={form.subCategory} onChange={e => set('subCategory', e.target.value)} className={inputClass()} disabled={!form.category}>
                    <option value="">Select sub-category</option>
                    {(SUB_CATEGORIES[form.category] || []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Brand</label>
                  <input type="text" value={form.brand} onChange={e => set('brand', e.target.value)} className={inputClass()} placeholder="Brand name" />
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          {activeSection === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Selling Price (₹) <span className="text-red-500">*</span></label>
                  <input type="number" value={form.sellingPrice || ''} onChange={e => set('sellingPrice', Number(e.target.value))} className={inputClass('sellingPrice')} placeholder="0.00" min="0" />
                  {errors.sellingPrice && <p className="text-red-500 text-xs mt-1">{errors.sellingPrice}</p>}
                </div>
                <div>
                  <label className={labelClass}>MRP (₹)</label>
                  <input type="number" value={form.mrp || ''} onChange={e => set('mrp', Number(e.target.value))} className={inputClass('mrp')} placeholder="0.00" min="0" />
                  {errors.mrp && <p className="text-red-500 text-xs mt-1">{errors.mrp}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Discount (%)</label>
                  <input type="number" value={form.discount || ''} onChange={e => set('discount', Number(e.target.value))} className={inputClass()} placeholder="Auto-calculated" min="0" max="100" />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated from price & MRP</p>
                </div>
                <div>
                  <label className={labelClass}>Tax / GST (%)</label>
                  <select value={form.taxGst} onChange={e => set('taxGst', Number(e.target.value))} className={inputClass()}>
                    {[0, 5, 12, 18, 28].map(t => <option key={t} value={t}>{t}%</option>)}
                  </select>
                </div>
              </div>
              {form.sellingPrice > 0 && form.mrp > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-blue-800 mb-2">Price Summary</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-gray-500">Selling Price</span><p className="font-bold text-gray-900">₹{form.sellingPrice.toLocaleString()}</p></div>
                    <div><span className="text-gray-500">MRP</span><p className="font-bold text-gray-900">₹{form.mrp.toLocaleString()}</p></div>
                    <div><span className="text-gray-500">Discount</span><p className="font-bold text-green-600">{form.discount}% off</p></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inventory */}
          {activeSection === 'inventory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Stock Quantity</label>
                  <input type="number" value={form.stockQuantity || ''} onChange={e => set('stockQuantity', Number(e.target.value))} className={inputClass()} placeholder="0" min="0" />
                </div>
                <div>
                  <label className={labelClass}>Minimum Order Quantity</label>
                  <input type="number" value={form.minimumOrderQuantity || ''} onChange={e => set('minimumOrderQuantity', Number(e.target.value))} className={inputClass()} placeholder="1" min="1" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Stock Status</label>
                <select value={form.stockStatus} onChange={e => set('stockStatus', e.target.value as any)} className={inputClass()}>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          )}

          {/* Images */}
          {activeSection === 'images' && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Upload product images. The first image or starred image will be used as the main product image.</p>
              <ImageUploader
                images={form.images}
                onChange={(imgs: ProductImage[]) => set('images', imgs)}
              />
            </div>
          )}

          {/* Product Details */}
          {activeSection === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Color</label>
                  <input type="text" value={form.color} onChange={e => set('color', e.target.value)} className={inputClass()} placeholder="e.g. Red, Blue" />
                </div>
                <div>
                  <label className={labelClass}>Size</label>
                  <input type="text" value={form.size} onChange={e => set('size', e.target.value)} className={inputClass()} placeholder="e.g. S, M, L, XL" />
                </div>
                <div>
                  <label className={labelClass}>Material</label>
                  <input type="text" value={form.material} onChange={e => set('material', e.target.value)} className={inputClass()} placeholder="e.g. Cotton, Leather" />
                </div>
                <div>
                  <label className={labelClass}>Weight</label>
                  <input type="text" value={form.weight} onChange={e => set('weight', e.target.value)} className={inputClass()} placeholder="e.g. 200g" />
                </div>
                <div>
                  <label className={labelClass}>Dimensions</label>
                  <input type="text" value={form.dimensions} onChange={e => set('dimensions', e.target.value)} className={inputClass()} placeholder="e.g. 30x25x2 cm" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    className={inputClass()}
                    placeholder="Add a tag and press Enter"
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors whitespace-nowrap">
                    Add
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                          <Icon name="XMarkIcon" size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEO */}
          {activeSection === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Meta Title</label>
                <input type="text" value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} className={inputClass()} placeholder="SEO page title" maxLength={60} />
                <p className="text-xs text-gray-500 mt-1">{form.metaTitle.length}/60 characters</p>
              </div>
              <div>
                <label className={labelClass}>Meta Description</label>
                <textarea value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} className={inputClass()} rows={3} placeholder="SEO description" maxLength={160} />
                <p className="text-xs text-gray-500 mt-1">{form.metaDescription.length}/160 characters</p>
              </div>
              <div>
                <label className={labelClass}>URL Slug</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
                  <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">/products/</span>
                  <input
                    type="text"
                    value={form.urlSlug}
                    onChange={e => set('urlSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="product-url-slug"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl gap-3">
          <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSubmit('draft')}
              className="px-5 py-2.5 border border-gray-400 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:cursor-wait disabled:opacity-60"
            >
              <Icon name="DocumentIcon" size={16} />
              Save as Draft
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSubmit('published')}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:cursor-wait disabled:opacity-60"
            >
              <Icon name="CheckCircleIcon" size={16} />
              {isSaving ? 'Saving...' : product ? 'Update & Publish' : 'Publish Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
