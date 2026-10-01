'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Toast, { ToastMessage } from '@/components/catalogue/Toast';
import DeleteConfirmation from '@/components/catalogue/DeleteConfirmation';
import ProductForm from '@/components/catalogue/ProductForm';
import ProductPreview from '@/components/catalogue/ProductPreview';
import {
  Product, ProductFormData,
  getAdminProducts, getAdminSession, addProduct, updateProduct, deleteProduct, toggleProductStatus, logoutAdmin,
  CATEGORIES,
} from '@/lib/catalogueStore';

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name_asc';

export default function CataloguePage() {
  const pathname = usePathname();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null | undefined>(undefined);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      setProducts(await getAdminProducts());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not connect to the product API.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (pathname === '/catalogue') {
      router.replace('/admin/products');
      return () => { active = false; };
    }

    void getAdminSession()
      .then(() => {
        if (!active) return;
        setIsAuthorized(true);
        void loadProducts();
      })
      .catch(() => {
        if (active) router.replace('/admin/login?next=/admin/products');
      });

    return () => { active = false; };
  }, [pathname, router, loadProducts]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) result = result.filter(p => p.category === categoryFilter);
    if (statusFilter) result = result.filter(p => p.status === statusFilter);
    if (stockFilter === 'in_stock') result = result.filter(p => p.stockStatus !== 'out_of_stock');
    if (stockFilter === 'out_of_stock') result = result.filter(p => p.stockStatus === 'out_of_stock');

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_asc': return a.sellingPrice - b.sellingPrice;
        case 'price_desc': return b.sellingPrice - a.sellingPrice;
        case 'name_asc': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
    return result;
  }, [products, search, categoryFilter, statusFilter, stockFilter, sortBy]);

  const stats = useMemo(() => ({
    total: products.length,
    published: products.filter(p => p.status === 'published').length,
    draft: products.filter(p => p.status === 'draft').length,
    outOfStock: products.filter(p => p.stockStatus === 'out_of_stock').length,
  }), [products]);

  const handleSave = useCallback(async (data: ProductFormData, status: 'published' | 'draft') => {
    if (editProduct && editProduct.id) {
      await updateProduct(editProduct.id, { ...data, status });
      addToast(`"${data.name}" updated successfully!`);
    } else {
      await addProduct({ ...data, status });
      addToast(`"${data.name}" ${status === 'published' ? 'published' : 'saved as draft'}!`);
    }
    setEditProduct(undefined);
    await loadProducts();
  }, [editProduct, addToast, loadProducts]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      addToast(`"${deleteTarget.name}" deleted.`, 'info');
      setDeleteTarget(null);
      await loadProducts();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not delete this product.', 'error');
    }
  }, [deleteTarget, addToast, loadProducts]);

  const handleToggleStatus = useCallback(async (product: Product) => {
    try {
      await toggleProductStatus(product.id);
      const newStatus = product.status === 'published' ? 'draft' : 'published';
      addToast(`"${product.name}" ${newStatus === 'published' ? 'published' : 'unpublished'}.`);
      await loadProducts();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not update product status.', 'error');
    }
  }, [addToast, loadProducts]);

  const stockBadge = (status: Product['stockStatus']) => {
    const map = {
      in_stock: 'bg-green-100 text-green-700',
      low_stock: 'bg-orange-100 text-orange-700',
      out_of_stock: 'bg-red-100 text-red-700',
    };
    const labels = { in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
  };

  const statusBadge = (status: Product['status']) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
      {status}
    </span>
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const mainImage = (product: Product) => {
    const img = product.images.find(i => i.isMain) || product.images[0];
    return img?.url || '';
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } finally {
      router.replace('/admin/login');
    }
  };

  if (pathname === '/catalogue' || !isAuthorized) {
    return <main className="flex min-h-screen items-center justify-center bg-canvas text-sm text-gray-600">Checking admin access...</main>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <Icon name="ArrowLeftIcon" size={18} />
                <span className="text-sm font-medium hidden sm:block">Back to Store</span>
              </Link>
              <div className="h-5 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="ArchiveBoxIcon" size={16} className="text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg">Catalogue</span>
              </div>
            </div>
            <button
              onClick={() => setEditProduct(null)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
            >
              <Icon name="PlusIcon" size={16} />
              <span className="hidden sm:block">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button type="button" onClick={() => void handleLogout()} title="Sign out" aria-label="Sign out of admin" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-200 hover:text-red-600">
              <Icon name="ArrowRightStartOnRectangleIcon" size={18} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your products, inventory and publishing status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Products', value: stats.total, icon: 'ArchiveBoxIcon', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
            { label: 'Published', value: stats.published, icon: 'CheckCircleIcon', color: 'bg-green-50 text-green-600', border: 'border-green-100' },
            { label: 'Draft', value: stats.draft, icon: 'DocumentIcon', color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100' },
            { label: 'Out of Stock', value: stats.outOfStock, icon: 'ExclamationCircleIcon', color: 'bg-red-50 text-red-600', border: 'border-red-100' },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-xl border ${stat.border} p-4 flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon name={stat.icon} size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, SKU, category..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <Icon name="XMarkIcon" size={14} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                <option value="">All Stock</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="name_asc">Name: A → Z</option>
              </select>
            </div>
          </div>

          {(search || categoryFilter || statusFilter || stockFilter) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}</span>
              <button
                onClick={() => { setSearch(''); setCategoryFilter(''); setStatusFilter(''); setStockFilter(''); }}
                className="text-xs text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Product Table / Cards */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading products...</p>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-semibold text-red-800">Could not load products</p>
            <p className="mt-1 text-sm text-red-700">{loadError}</p>
            <button onClick={() => void loadProducts()} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Retry</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="ArchiveBoxXMarkIcon" size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search || categoryFilter || statusFilter || stockFilter ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {search || categoryFilter || statusFilter || stockFilter
                ? 'Try adjusting your search or filters' :'Add your first product to get started'}
            </p>
            {!search && !categoryFilter && !statusFilter && !stockFilter && (
              <button
                onClick={() => setEditProduct(null)}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                <Icon name="PlusIcon" size={16} />
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Updated</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {mainImage(product) ? (
                                <img src={mainImage(product)} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon name="PhotoIcon" size={20} className="text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{product.name}</p>
                              {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{product.sku}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{product.category}</span>
                          {product.subCategory && <p className="text-xs text-gray-400">{product.subCategory}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-gray-900">₹{product.sellingPrice.toLocaleString()}</p>
                          {product.mrp > product.sellingPrice && (
                            <p className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">{product.stockQuantity}</p>
                            {stockBadge(product.stockStatus)}
                          </div>
                        </td>
                        <td className="px-4 py-3">{statusBadge(product.status)}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-500">{formatDate(product.updatedAt)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewProduct(product)}
                              title="View"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Icon name="EyeIcon" size={16} />
                            </button>
                            <button
                              onClick={() => setEditProduct(product)}
                              title="Edit"
                              className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <Icon name="PencilSquareIcon" size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(product)}
                              title={product.status === 'published' ? 'Unpublish' : 'Publish'}
                              className={`p-1.5 rounded-lg transition-colors ${product.status === 'published' ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                            >
                              <Icon name={product.status === 'published' ? 'EyeSlashIcon' : 'CheckCircleIcon'} size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              title="Delete"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Icon name="TrashIcon" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {mainImage(product) ? (
                        <img src={mainImage(product)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="PhotoIcon" size={24} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</p>
                        {statusBadge(product.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">{product.sku}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-base font-bold text-gray-900">₹{product.sellingPrice.toLocaleString()}</span>
                        {stockBadge(product.stockStatus)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{product.category} · Updated {formatDate(product.updatedAt)}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setViewProduct(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Icon name="EyeIcon" size={16} />
                      </button>
                      <button onClick={() => setEditProduct(product)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Icon name="PencilSquareIcon" size={16} />
                      </button>
                      <button onClick={() => handleToggleStatus(product)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Icon name={product.status === 'published' ? 'EyeSlashIcon' : 'CheckCircleIcon'} size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(product)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Icon name="TrashIcon" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </div>

      {/* Modals */}
      {editProduct !== undefined && (
        <ProductForm
          product={editProduct}
          onSave={handleSave}
          onCancel={() => setEditProduct(undefined)}
        />
      )}

      {viewProduct && (
        <ProductPreview
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onEdit={() => { setEditProduct(viewProduct); setViewProduct(null); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmation
          productName={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
