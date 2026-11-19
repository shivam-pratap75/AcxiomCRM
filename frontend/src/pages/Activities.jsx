
import { useEffect, useState } from 'react';
import api from '../services/api';

const initialForm = {
  subject: '',
  type: 'Call',
  description: '',
  activityDate: '',
  relatedTo: 'Lead',
  lead: '',
  customer: ''
};

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchActivities = async () => {
    try {
      setLoading(true);

      const response = await api.get('/activities', {
        params: {
          type: type || undefined,
          status: status || undefined
        }
      });

      setActivities(response.data.activities || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load activities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [type, status]);

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
      subject: item.subject,
      type: item.type,
      description: item.description || '',
      activityDate: new Date(item.activityDate).toISOString().slice(0, 16),
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

      if (editingId) {
        await api.put(`/activities/${editingId}`, {
          subject: form.subject,
          type: form.type,
          description: form.description,
          activityDate: form.activityDate
        });
      } else {
        await api.post('/activities', {
          ...form,
          lead: form.relatedTo === 'Lead' ? form.lead : undefined,
          customer: form.relatedTo === 'Customer' ? form.customer : undefined
        });
      }

      setShowForm(false);
      setEditingId(null);
      setForm(initialForm);
      await fetchActivities();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save activity.');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/activities/${id}`, { status: newStatus });
      await fetchActivities();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update activity.');
    }
  };

  const deleteActivity = async (id) => {
    if (!window.confirm('Delete this activity?')) return;

    try {
      await api.delete(`/activities/${id}`);
      await fetchActivities();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete activity.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activities</h1>
          <p className="text-sm text-gray-500">
            Track calls, meetings, emails and tasks.
          </p>
        </div>

        <button onClick={openAdd} className="rounded-lg bg-blue-600 px-5 py-2.5 text-white">
          + Add Activity
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border px-4 py-2">
          <option value="">All types</option>
          <option value="Call">Call</option>
          <option value="Meeting">Meeting</option>
          <option value="Email">Email</option>
          <option value="Task">Task</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border px-4 py-2">
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
              <th className="p-4">Subject</th>
              <th className="p-4">Type</th>
              <th className="p-4">Related Record</th>
              <th className="p-4">Date</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center">Loading...</td></tr>
            ) : activities.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">No activities found.</td></tr>
            ) : activities.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-semibold">{item.subject}</p>
                  <p className="text-gray-500">{item.description}</p>
                </td>
                <td className="p-4">{item.type}</td>
                <td className="p-4">
                  {item.lead?.name || item.customer?.name || '-'}
                </td>
                <td className="p-4">
                  {new Date(item.activityDate).toLocaleString()}
                </td>
                <td className="p-4">{item.assignedTo?.name || '-'}</td>
                <td className="p-4">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item._id, e.target.value)}
                    className="rounded-lg border px-2 py-1"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(item)} className="text-blue-600">Edit</button>
                    <button onClick={() => deleteActivity(item._id)} className="text-red-600">Delete</button>
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
            <h2 className="mb-5 text-xl font-bold">
              {editingId ? 'Edit Activity' : 'Add Activity'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                placeholder="Activity subject"
                className="w-full rounded-lg border p-3"
              />

              <select name="type" value={form.type} onChange={handleChange} className="w-full rounded-lg border p-3">
                <option value="Call">Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Email">Email</option>
                <option value="Task">Task</option>
              </select>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full rounded-lg border p-3"
              />

              <label className="block text-sm font-medium">Activity date and time</label>
              <input
                type="datetime-local"
                name="activityDate"
                value={form.activityDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3"
              />

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

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-white">
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

export default Activities;
