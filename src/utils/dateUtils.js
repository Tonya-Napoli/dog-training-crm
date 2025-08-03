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