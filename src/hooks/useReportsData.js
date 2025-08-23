// src/hooks/useReportsData.js
import { useState, useEffect, useMemo } from 'react';
import axios from '../axios.js';
import { getDateRange, isDateInRange } from '../utils/dateUtils.js';

export const useReportsData = (timeFilter) => {
  const [clients, setClients] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [clientsRes, trainersRes, contactsRes] = await Promise.all([
        axios.get('/auth/clients'),
        axios.get('/auth/trainers'),
        axios.get('/contacts?page=1&perPage=1000')
      ]);
     
      setClients(clientsRes.data.clients || []);
      setTrainers(trainersRes.data.trainers || []);
      setContacts(contactsRes.data.contacts || []);
    } catch (err) {
      console.error('Failed to fetch reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() =>
    calculateFilteredStats(clients, trainers, contacts, timeFilter),
    [clients, trainers, contacts, timeFilter]
  );

  useEffect(() => {
    fetchAllData();
  }, []);

  return { stats, loading, refetch: fetchAllData };
};

const calculateFilteredStats = (clients, trainers, contacts, timeFilter) => {
  const dateRange = getDateRange(timeFilter);
 
  const filteredClients = filterByDate(clients, dateRange, 'created');
  const filteredTrainers = filterByDate(trainers, dateRange, 'created', 'createdAt');
  const filteredContacts = filterByDate(contacts, dateRange, 'createdAt');
 
  return {
    totalClients: filteredClients.length,
    activeTrainers: filteredTrainers.filter(t => t.isActive).length,
    newInquiries: filteredContacts.filter(c => c.status === 'New').length,
    totalInquiries: filteredContacts.length
  };
};

const filterByDate = (items, dateRange, primaryDateField, fallbackDateField) => {
  return items.filter(item => {
    const date = item[primaryDateField] || item[fallbackDateField];
    return date && isDateInRange(date, dateRange);
  });
};