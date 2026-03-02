import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '' });
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products?search=${search}&page=${page}&limit=10`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError('Could not connect to the server. Make sure the backend is running and the Aiven DB is connected.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct
        ? `${API_BASE}/products/${editingProduct.id}`
        : `${API_BASE}/products`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Action failed');

      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', stock: '' });
      fetchProducts();
    } catch (err) {
      alert('Error saving product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchProducts();
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setIsModalOpen(true);
  };

  return (
    <div className="container">
      <header>
        <div>
          <h1>Inventory Master</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your products with ease</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditingProduct(null);
          setFormData({ name: '', price: '', stock: '' });
          setIsModalOpen(true);
        }}>
          <Plus size={18} /> Add Product
        </button>
      </header>

      {error && (
        <div style={{
          background: '#f5f5f5',
          color: '#000000',
          padding: '1rem',
          border: '1px solid #000000',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="card">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total Items</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{pagination?.total || 0}</div>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Added Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="loader">Loading inventory...</div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No products found
                  </td>
                </tr>
              ) : products.map(product => (
                <tr key={product.id}>
                  <td style={{ fontWeight: '500' }}>{product.name}</td>
                  <td style={{ color: '#000000', fontWeight: 'bold' }}>
                    ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className={`badge ${product.stock > 10 ? 'badge-stock' : 'badge-low'}`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" onClick={() => openEditModal(product)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-ghost btn-danger" onClick={() => handleDelete(product.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Page <strong>{page}</strong> of {pagination.totalPages}
            </span>
            <button
              className="btn btn-ghost"
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '1.5rem' }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Wireless Mouse"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
