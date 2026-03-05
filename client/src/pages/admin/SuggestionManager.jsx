import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getAdminSuggestions, createSuggestion, updateSuggestion, deleteSuggestion } from '../../api';

function getCurrentMonthYear() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function SuggestionManager() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', image_url: '' });
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    getAdminSuggestions()
      .then(setSuggestions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    try {
      if (editing) {
        await updateSuggestion(editing.id, form);
      } else {
        await createSuggestion({ ...form, month_year: getCurrentMonthYear() });
      }
      setShowForm(false);
      setEditing(null);
      setForm({ title: '', description: '', image_url: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this suggestion?')) return;
    try {
      await deleteSuggestion(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (s) => {
    setEditing(s);
    setForm({ title: s.title, description: s.description || '', image_url: s.image_url || '' });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Suggestions</h1>
          <p className="text-sm text-gray-500">Cycle: {getCurrentMonthYear()}</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', description: '', image_url: '' }); }}
          className="bg-blair-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blair-navy-light flex items-center gap-2"
        >
          <Plus size={16} /> Add Suggestion
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Suggestion' : 'New Suggestion'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="bg-blair-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blair-navy-light">
                  {editing ? 'Save' : 'Create'}
                </button>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-6 animate-pulse space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-4">
              {s.image_url && (
                <img src={s.image_url} alt="" className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-green-600">+{s.upvotes} upvotes</span>
                  <span className="text-red-500">-{s.downvotes} downvotes</span>
                  <span className="font-medium text-gray-700">Net: {s.net_votes}</span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {suggestions.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">
              No suggestions yet. Click "Add Suggestion" to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
