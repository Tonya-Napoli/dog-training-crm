export const ADMIN_TABS = {
  CONTACTS: 'contacts',
  CLIENTS: 'clients', 
  TRAINERS: 'trainers',
  REPORTS: 'reports',
  BILLING: 'billing'
};

export const CONTACT_STATUSES = ['New', 'Contacted', 'Scheduled', 'Closed'];

export const TIME_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: '1week', label: 'Last 7 Days' },
  { value: '1month', label: 'Last Month' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '1year', label: 'Last Year' },
  { value: 'all', label: 'All Time' }
];

export const PAGINATION_SIZE = 10;