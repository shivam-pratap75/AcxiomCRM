
import { useEffect, useState } from 'react';
import api from '../services/api';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  source: 'Website',
  expectedValue: '',
  notes: ''
};

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/leads', {
        params: {
          search: search || undefined,
          status: status || undefined
        }
      });

      setLeads(response.data.leads || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch leads.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, status]);

  // Handle form inputs
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Open add form
  const openAddForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (lead) => {
    setForm({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || 'Other',
      expectedValue: lead.expectedValue ?? '',
      notes: lead.notes || ''
    });

    setEditingId(lead._id);
    setShowForm(true);
  };

  // Add or update lead
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');

      const payload = {
        ...form,
        expectedValue: Number(form.expectedValue || 0)
      };

      if (editingId) {
        await api.put(`/leads/${editingId}`, payload);
      } else {
        await api.post('/leads', payload);
      }

      setShowForm(false);
      setForm(initialForm);
      setEditingId(null);

      await fetchLeads();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to save lead.'
      );
    }
  };

  // Update lead status
  const updateStatus = async (id, newStatus) => {
    try {
      setError('');
      await api.put(`/leads/${id}`, { status: newStatus });
      await fetchLeads();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to update lead status.'
      );
    }
  };

  // Delete lead
  const deleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      setError('');
      await api.delete(`/leads/${id}`);
      await fetchLeads();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to delete lead.'
      );
    }
  };

  // Convert lead into customer
  const convertLead = async (id) => {
    if (!window.confirm('Convert this lead into a customer?')) {
      return;
    }

    try {
      setError('');
      const response = await api.post(`/leads/${id}/convert`);

      alert(response.data.message || 'Lead converted successfully.');
      await fetchLeads();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to convert lead.'
      );
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const getStatusStyle = (value) => {
    const styles = {
      New: 'bg-blue-100 text-blue-700',
      Contacted: 'bg-yellow-100 text-yellow-700',
      Qualified: 'bg-green-100 text-green-700',
      Lost: 'bg-red-100 text-red-700',
      Converted: 'bg-purple-100 text-purple-700'
    };

    return styles[value] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">

      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Leads
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage potential customers and track their progress.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          + Add Lead
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search and status filter */}
      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
          <option value="Converted">Converted</option>
        </select>
      </div>

      {/* Leads table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-4">Lead</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Source</th>
              <th className="px-5 py-4">Expected Value</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Assigned To</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-5 py-8 text-center text-gray-500">
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-8 text-center text-gray-500">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">
                      {lead.name}
                    </p>
                    <p className="text-gray-500">{lead.email}</p>
                  </td>

                  <td className="px-5 py-4">{lead.phone}</td>

                  <td className="px-5 py-4">{lead.source}</td>

                  <td className="px-5 py-4">
                    ₹{Number(lead.expectedValue || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead._id, e.target.value)}
                      disabled={lead.status === 'Converted'}
                      className={`rounded-full px-3 py-1 text-xs font-medium outline-none ${getStatusStyle(lead.status)}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Lost">Lost</option>
                      <option value="Converted">Converted</option>
                    </select>
                  </td>

                  <td className="px-5 py-4">
                    {lead.assignedTo?.name || '-'}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => openEditForm(lead)}
                        className="font-medium text-blue-600"
                      >
                        Edit
                      </button>

                      {lead.status !== 'Converted' && (
                        <button
                          onClick={() => convertLead(lead._id)}
                          className="font-medium text-green-600"
                        >
                          Convert
                        </button>
                      )}

                      <button
                        onClick={() => deleteLead(lead._id)}
                        className="font-medium text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Lead' : 'Add New Lead'}
              </h2>

              <button
                onClick={closeForm}
                className="text-2xl text-gray-500"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Lead Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Enter lead name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Enter phone"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Lead Source
                </label>
                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Expected Value (₹)
                </label>
                <input
                  type="number"
                  name="expectedValue"
                  value={form.expectedValue}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Enter expected value"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Additional information..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                  {editingId ? 'Update Lead' : 'Save Lead'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
