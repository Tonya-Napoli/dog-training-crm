import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../axios.js';

const ContactsTab = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 10;

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page, perPage });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`/contacts?${params.toString()}`);
      setContacts(response.data.contacts || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const updateContactStatus = useCallback(async (contactId, newStatus) => {
    try {
      await axios.put(`/contacts/${contactId}`, { status: newStatus });
      fetchContacts();
    } catch (err) {
      console.error('Error updating contact status:', err);
      alert('Failed to update contact status.');
    }
  }, [fetchContacts]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / perPage);

  if (loading) {
    return <div className="text-center py-4">Loading contacts...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Contact Inquiries</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={handleSearchChange}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="font-semibold text-blue-900 text-sm">Total</h3>
          <p className="text-xl font-bold text-blue-600">{total}</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <h3 className="font-semibold text-yellow-900 text-sm">New</h3>
          <p className="text-xl font-bold text-yellow-600">
            {contacts.filter((c) => c.status === 'New').length}
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <h3 className="font-semibold text-green-900 text-sm">Contacted</h3>
          <p className="text-xl font-bold text-green-600">
            {contacts.filter((c) => c.status === 'Contacted').length}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="font-semibold text-gray-900 text-sm">Closed</h3>
          <p className="text-xl font-bold text-gray-600">
            {contacts.filter((c) => c.status === 'Closed').length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Email</th>
              <th className="p-3 text-left font-semibold">Phone</th>
              <th className="p-3 text-left font-semibold">Message</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Created</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => (
              <tr
                key={contact._id}
                className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
              >
                <td className="p-3">{contact.name}</td>
                <td className="p-3">{contact.email}</td>
                <td className="p-3">{contact.phone || 'N/A'}</td>
                <td className="p-3 max-w-xs truncate" title={contact.message}>
                  {contact.message}
                </td>
                <td className="p-3">
                  <select
                    value={contact.status}
                    onChange={(e) => updateContactStatus(contact._id, e.target.value)}
                    className={`px-2 py-1 rounded text-xs border-0 ${
                      contact.status === 'New'
                        ? 'bg-blue-100 text-blue-800'
                        : contact.status === 'Contacted'
                        ? 'bg-yellow-100 text-yellow-800'
                        : contact.status === 'Scheduled'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
                <td className="p-3">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Email
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > perPage && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setPage((prev) => prev - 1)}
            disabled={page === 1}
            className="px-4 py-2 mr-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 ml-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactsTab;