// src/utils/dateUtils.js
export const getDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
 
  const ranges = {
    today: { start: today, end: now },
    '1week': { start: subtractDays(today, 7), end: now },
    '1month': { start: subtractMonths(today, 1), end: now },
    '6months': { start: subtractMonths(today, 6), end: now },
    '1year': { start: subtractYears(today, 1), end: now },
    all: { start: new Date(0), end: now }
  };
  return ranges[period] || ranges.all;
};

const subtractDays = (date, days) => {
  const result = new Date(date);
  result.setDate(date.getDate() - days);
  return result;
};

const subtractMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(date.getMonth() - months);
  return result;
};

const subtractYears = (date, years) => {
  const result = new Date(date);
  result.setFullYear(date.getFullYear() - years);
  return result;
};

export const isDateInRange = (date, range) => {
  const targetDate = new Date(date);
  return targetDate >= range.start && targetDate <= range.end;
};

// Additional utility functions that might be needed
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
};

export const getDaysAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now - past);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getRelativeTimeString = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffTime = now - past;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};