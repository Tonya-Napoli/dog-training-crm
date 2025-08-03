// src/hooks/useContacts.js
import { useState, useEffect } from 'react';
import axios from '../axios';
import { PAGINATION_SIZE } from '../constants/adminConstants';

export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = buildQueryParams(page, search, statusFilter);
      const response = await axios.get(`/contacts?${params}`);
      
      setContacts(response.data.contacts);
      setTotal(response.data.total);
    } catch (err) {
      setError('Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (id, status) => {
    try {
      const response = await axios.put(`/contacts/${id}/status`, { status });
      updateContactInList(id, response.data);
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const updateContactNotes = async (id, notes) => {
    try {
      const response = await axios.put(`/contacts/${id}/notes`, { followUpNotes: notes });
      updateContactInList(id, response.data);
    } catch (err) {
      setError('Failed to update notes.');
    }
  };

  const updateContactInList = (id, updatedContact) => {
    setContacts(contacts.map(contact => 
      contact._id === id ? updatedContact : contact
    ));
  };

  useEffect(() => {
    fetchContacts();
  }, [page, search, statusFilter]);

  return {
    contacts,
    loading,
    error,
    page,
    total,
    search,
    statusFilter,
    setPage,
    setSearch,
    setStatusFilter,
    updateContactStatus,
    updateContactNotes,
    refetch: fetchContacts
  };
};

const buildQueryParams = (page, search, statusFilter) => {
  const params = new URLSearchParams({ page, perPage: PAGINATION_SIZE });
  if (search) params.append('search', search);
  if (statusFilter) params.append('status', statusFilter);
  return params.toString();
};