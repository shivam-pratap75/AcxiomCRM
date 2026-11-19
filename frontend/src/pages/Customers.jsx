
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  status: 'Active',
  notes: ''
};

const Customers = () => {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/customers', {
        params: {
          search: search || undefined,
          status: status || undefined
        }
      });

      setCustomers(response.data.customers || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch customers.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, status]);

  // Handle form input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Open form for adding a customer
  const openAddForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  // Open form for editing a customer
  const openEditForm = (customer) => {
    setForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      status: customer.status || 'Active',
      notes: customer.notes || ''
    });

    setEditingId(customer._id);
    setShowForm(true);
  };

  // Create or update customer
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');

      if (editingId) {
        await api.put(`/customers/${editingId}`, form);
      } else {
        await api.post('/customers', form);
      }

      setShowForm(false);
      setForm(initialForm);
      setEditingId(null);

      await fetchCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to save customer.'
      );
    }
  };

  // Delete customer
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this customer?'
    );

    if (!confirmed) return;

    try {
      setError('');
      await api.delete(`/customers/${id}`);
      await fetchCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to delete customer.'
      );
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  };

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Customers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your customer information.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          + Add Customer
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search and filter */}
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
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Customer table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Address</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Assigned To</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-gray-500">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">
                      {customer.name}
                    </p>
                    <p className="text-gray-500">{customer.email}</p>
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {customer.phone}
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {customer.address || '-'}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        customer.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {customer.assignedTo?.name || '-'}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditForm(customer)}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="font-medium text-red-600 hover:text-red-800"
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

      {/* Add/Edit customer form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Customer' : 'Add New Customer'}
              </h2>

              <button
                onClick={closeForm}
                className="text-2xl text-gray-500 hover:text-gray-800"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Customer Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Enter address"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                  {editingId ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;
