// src/components/admin/ContactsTab.jsx
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchContacts();
  }, [page, search, statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, perPage });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const response = await axios.get(`/contacts?${params.toString()}`);
      setContacts(response.data.contacts);
      setTotal(response.data.total);
      setLoading(false);
    } catch (err) {
      setError('Failed to load contacts.');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading contacts...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">Contact Inquiries</h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Contacts Table */}
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
                <td className="p-3 max-w-xs truncate">{contact.message}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    contact.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    contact.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                    contact.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {contact.status}
                  </span>
                </td>
                <td className="p-3">{new Date(contact.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > perPage && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 mr-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {Math.ceil(total / perPage)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / perPage)}
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