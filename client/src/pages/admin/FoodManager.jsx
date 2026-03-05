import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Image } from 'lucide-react';
import {
  getAdminFoodItems, createFoodItem, updateFoodItem, deleteFoodItem,
  getCycles, addToCycle, removeFromCycle, uploadImage,
} from '../../api';

const TABS = [
  { key: 'hot_mains', label: 'Hot Mains' },
  { key: 'global_flavors', label: 'Global Flavors' },
  { key: 'desserts', label: 'Desserts' },
];

function getCurrentMonthYear() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function FoodManager() {
  const [activeTab, setActiveTab] = useState('hot_mains');
  const [items, setItems] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image_url: '', tab_category: 'hot_mains' });
  const [error, setError] = useState('');
  const monthYear = getCurrentMonthYear();

  const loadData = async () => {
    setLoading(true);
    try {
      const [foodItems, monthCycles] = await Promise.all([
        getAdminFoodItems(activeTab),
        getCycles(monthYear),
      ]);
      setItems(foodItems);
      setCycles(monthCycles);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [activeTab]);

  const cycleItemIds = new Set(
    cycles.filter((c) => c.tab_category === activeTab).map((c) => c.food_item_id)
  );

  const handleSave = async () => {
    setError('');
    if (!form.name.trim()) { setError('Name is required'); return; }
    try {
      if (editing) {
        await updateFoodItem(editing.id, { ...form, tab_category: activeTab });
      } else {
        await createFoodItem({ ...form, tab_category: activeTab });
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '', image_url: '', tab_category: activeTab });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item? This will also remove all associated ratings and reviews.')) return;
    try {
      await deleteFoodItem(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleCycle = async (item) => {
    try {
      if (cycleItemIds.has(item.id)) {
        const cycle = cycles.find((c) => c.food_item_id === item.id && c.tab_category === activeTab);
        if (cycle) await removeFromCycle(cycle.id);
      } else {
        await addToCycle({ food_item_id: item.id, tab_category: activeTab, month_year: monthYear });
      }
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description || '', image_url: item.image_url || '', tab_category: item.tab_category });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Food Items</h1>
          <p className="text-sm text-gray-500">Active cycle: {monthYear}</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '', image_url: '', tab_category: activeTab }); }}
          className="bg-blair-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blair-navy-light flex items-center gap-2"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-blair-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Item' : 'Add New Item'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blair-navy" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blair-navy resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blair-navy" />
                <div className="mt-1">
                  <label className="text-xs text-blair-navy cursor-pointer hover:underline flex items-center gap-1">
                    <Image size={12} /> Or upload an image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="bg-blair-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blair-navy-light">
                  {editing ? 'Save Changes' : 'Create Item'}
                </button>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items table */}
      {loading ? (
        <div className="bg-white rounded-xl p-6 animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">In Cycle</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <img src={item.image_url || 'https://via.placeholder.com/60x45'} alt="" className="w-16 h-12 object-cover rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleCycle(item)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        cycleItemIds.has(item.id)
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {cycleItemIds.has(item.id) ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className="text-center py-8 text-gray-400">No items yet. Click "Add Item" to get started.</p>
          )}
        </div>
      )}
    </div>
  );
}
