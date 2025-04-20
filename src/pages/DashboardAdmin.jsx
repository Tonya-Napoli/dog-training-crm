import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios.js';
import { debounce } from 'lodash';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 10;

  // Fetch contacts on mount and when page, search, or status changes
  useEffect(() => {
    const fetchContacts = async () => {
      try {
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
    fetchContacts();
  }, [page, search, statusFilter]);

  // Update contact status
  const handleStatusChange = async (id, status) => {
    try {
      const response = await axios.put(`/contacts/${id}/status`, { status });
      setContacts(
        contacts.map((contact) =>
          contact._id === id ? response.data : contact
        )
      );
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  // Update follow-up notes (debounced)
  const handleNotesChange = debounce(async (id, notes) => {
    try {
      const response = await axios.put(`/contacts/${id}/notes`, {
        followUpNotes: notes,
      });
      setContacts(
        contacts.map((contact) =>
          contact._id === id ? response.data : contact
        )
      );
    } catch (err) {
      setError('Failed to update notes.');
    }
  }, 500);

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-500">Unauthorized access.</div>;
  }

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
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
                <th className="p-3 text-left font-semibold">Follow-Up Notes</th>
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
                  <td className="p-3">{contact.message}</td>
                  <td className="p-3">
                    <select
                      value={contact.status}
                      onChange={(e) =>
                        handleStatusChange(contact._id, e.target.value)
                      }
                      className="p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <textarea
                      value={contact.followUpNotes || ''}
                      onChange={(e) =>
                        handleNotesChange(contact._id, e.target.value)
                      }
                      placeholder="Add follow-up notes..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </td>
                  <td className="p-3">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(total / perPage)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / perPage)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;