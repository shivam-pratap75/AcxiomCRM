
import { useEffect, useState } from 'react';
import api from '../services/api';

const initialForm = {
  title: '',
  description: '',
  followUpDate: '',
  relatedTo: 'Lead',
  lead: '',
  customer: ''
};

const FollowUps = () => {
  const [followUps, setFollowUps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const response = await api.get('/followups', {
        params: { status: status || undefined }
      });
      setFollowUps(response.data.followUps || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load follow-ups.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedRecords = async () => {
    try {
      const [leadResponse, customerResponse] = await Promise.all([
        api.get('/leads'),
        api.get('/customers')
      ]);

      setLeads(leadResponse.data.leads || []);
      setCustomers(customerResponse.data.customers || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads and customers.');
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [status]);

  useEffect(() => {
    fetchRelatedRecords();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'relatedTo'
        ? { lead: '', customer: '' }
        : {})
    }));
  };

  const openAddForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setForm({
      title: item.title,
      description: item.description || '',
      followUpDate: new Date(item.followUpDate).toISOString().slice(0, 10),
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
        lead: form.relatedTo === 'Lead' ? form.lead : undefined,
        customer: form.relatedTo === 'Customer' ? form.customer : undefined
      };

      if (editingId) {
        await api.put(`/followups/${editingId}`, {
          title: form.title,
          description: form.description,
          followUpDate: form.followUpDate
        });
      } else {
        await api.post('/followups', payload);
      }

      setShowForm(false);
      setForm(initialForm);
      setEditingId(null);
      await fetchFollowUps();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save follow-up.');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setError('');
      await api.put(`/followups/${id}`, { status: newStatus });
      await fetchFollowUps();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update status.');
    }
  };

  const deleteFollowUp = async (id) => {
    if (!window.confirm('Delete this follow-up?')) return;

    try {
      await api.delete(`/followups/${id}`);
      await fetchFollowUps();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete follow-up.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Follow-ups</h1>
          <p className="text-sm text-gray-500">
            Schedule and track customer and lead follow-ups.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
        >
          + Schedule Follow-up
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        >
          <option value="">All statuses</option>
          <option value="Planned">Planned</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-4">Follow-up</th>
              <th className="px-5 py-4">Related Record</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Assigned To</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr>
            ) : followUps.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No follow-ups found.</td></tr>
            ) : followUps.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-gray-500">{item.description}</p>
                </td>
                <td className="px-5 py-4">
                  <p>{item.relatedTo}</p>
                  <p className="text-gray-500">
                    {item.lead?.name || item.customer?.name || '-'}
                  </p>
                </td>
                <td className="px-5 py-4">
                  {new Date(item.followUpDate).toLocaleDateString()}
                </td>
                <td className="px-5 py-4">
                  {item.assignedTo?.name || '-'}
                </td>
                <td className="px-5 py-4">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item._id, e.target.value)}
                    className="rounded-full border border-gray-200 px-2 py-1"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEditForm(item)} className="text-blue-600">
                      Edit
                    </button>
                    <button onClick={() => deleteFollowUp(item._id)} className="text-red-600">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
            <h2 className="mb-5 text-xl font-bold">
              {editingId ? 'Edit Follow-up' : 'Schedule Follow-up'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Follow-up title"
                className="w-full rounded-lg border p-3"
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full rounded-lg border p-3"
              />

              <div>
                <label className="mb-1 block text-sm font-medium">Follow-up date</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={form.followUpDate}
                  onChange={handleChange}
                  min={new Date().toLocaleDateString('en-CA')}
                  required
                  className="w-full rounded-lg border p-3"
                />
              </div>

              {!editingId && (
                <>
                  <select
                    name="relatedTo"
                    value={form.relatedTo}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Customer">Customer</option>
                  </select>

                  {form.relatedTo === 'Lead' ? (
                    <select
                      name="lead"
                      value={form.lead}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border p-3"
                    >
                      <option value="">Select a lead</option>
                      {leads.map((lead) => (
                        <option key={lead._id} value={lead._id}>
                          {lead.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      name="customer"
                      value={form.customer}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border p-3"
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white"
                >
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUps;
