
import { useEffect, useState } from 'react';
import api from '../services/api';

const stages = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost'
];

const initialForm = {
  title: '',
  description: '',
  amount: '',
  probability: 10,
  expectedCloseDate: '',
  stage: 'Prospecting',
  relatedTo: 'Lead',
  lead: '',
  customer: ''
};

const Opportunities = () => {
  const [items, setItems] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/opportunities', {
        params: { search: search || undefined, stage: stage || undefined }
      });
      setItems(response.data.opportunities || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, stage]);

  useEffect(() => {
    Promise.all([api.get('/leads'), api.get('/customers')])
      .then(([leadRes, customerRes]) => {
        setLeads(leadRes.data.leads || []);
        setCustomers(customerRes.data.customers || []);
      })
      .catch(() => setError('Could not load leads and customers.'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'relatedTo' ? { lead: '', customer: '' } : {})
    }));
  };

  const openAdd = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      title: item.title,
      description: item.description || '',
      amount: item.amount,
      probability: item.probability,
      expectedCloseDate: new Date(item.expectedCloseDate).toISOString().slice(0, 10),
      stage: item.stage,
      relatedTo: item.relatedTo,
      lead: item.lead?._id || '',
      customer: item.customer?._id || ''
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const payload = {
        ...form,
        amount: Number(form.amount),
        probability: Number(form.probability),
        lead: form.relatedTo === 'Lead' ? form.lead : undefined,
        customer: form.relatedTo === 'Customer' ? form.customer : undefined
      };

      if (editingId) {
        await api.put(`/opportunities/${editingId}`, {
          title: payload.title,
          description: payload.description,
          amount: payload.amount,
          probability: payload.probability,
          expectedCloseDate: payload.expectedCloseDate,
          stage: payload.stage
        });
      } else {
        await api.post('/opportunities', payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);
      await fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save opportunity.');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this opportunity?')) return;
    try {
      await api.delete(`/opportunities/${id}`);
      await fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete opportunity.');
    }
  };

  const changeStage = async (id, newStage) => {
    try {
      await api.put(`/opportunities/${id}`, { stage: newStage });
      await fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update stage.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Opportunities</h1>
          <p className="text-sm text-gray-500">Track potential deals and sales pipeline.</p>
        </div>
        <button onClick={openAdd} className="rounded-lg bg-blue-600 px-5 py-2.5 text-white">
          + Add Opportunity
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search opportunity title..."
          className="flex-1 rounded-lg border px-4 py-2"
        />
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="rounded-lg border px-4 py-2">
          <option value="">All stages</option>
          {stages.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4">Opportunity</th>
              <th className="p-4">Related To</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Probability</th>
              <th className="p-4">Expected Close</th>
              <th className="p-4">Stage</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">No opportunities found.</td></tr>
            ) : items.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-gray-500">{item.assignedTo?.name || '-'}</p>
                </td>
                <td className="p-4">{item.lead?.name || item.customer?.name || '-'}</td>
                <td className="p-4">₹{Number(item.amount).toLocaleString('en-IN')}</td>
                <td className="p-4">{item.probability}%</td>
                <td className="p-4">{new Date(item.expectedCloseDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <select value={item.stage} onChange={(e) => changeStage(item._id, e.target.value)} className="rounded-lg border px-2 py-1">
                    {stages.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(item)} className="text-blue-600">Edit</button>
                    <button onClick={() => deleteItem(item._id)} className="text-red-600">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6">
            <h2 className="mb-5 text-xl font-bold">{editingId ? 'Edit Opportunity' : 'Add Opportunity'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Opportunity title" className="w-full rounded-lg border p-3" />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full rounded-lg border p-3" />

              {!editingId && (
                <>
                  <select name="relatedTo" value={form.relatedTo} onChange={handleChange} className="w-full rounded-lg border p-3">
                    <option value="Lead">Lead</option>
                    <option value="Customer">Customer</option>
                  </select>
                  {form.relatedTo === 'Lead' ? (
                    <select name="lead" value={form.lead} onChange={handleChange} required className="w-full rounded-lg border p-3">
                      <option value="">Select lead</option>
                      {leads.map((lead) => <option key={lead._id} value={lead._id}>{lead.name}</option>)}
                    </select>
                  ) : (
                    <select name="customer" value={form.customer} onChange={handleChange} required className="w-full rounded-lg border p-3">
                      <option value="">Select customer</option>
                      {customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name}</option>)}
                    </select>
                  )}
                </>
              )}

              <label className="block text-sm font-medium">Deal amount (₹)</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange} min="0.01" step="0.01" required className="w-full rounded-lg border p-3" />

              <label className="block text-sm font-medium">Probability (%)</label>
              <input type="number" name="probability" value={form.probability} onChange={handleChange} min="0" max="100" required className="w-full rounded-lg border p-3" />

              <label className="block text-sm font-medium">Expected closing date</label>
              <input type="date" name="expectedCloseDate" value={form.expectedCloseDate} onChange={handleChange} min={new Date().toLocaleDateString('en-CA')} required className="w-full rounded-lg border p-3" />

              <select name="stage" value={form.stage} onChange={handleChange} className="w-full rounded-lg border p-3">
                {stages.map((s) => <option key={s}>{s}</option>)}
              </select>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-white">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;
