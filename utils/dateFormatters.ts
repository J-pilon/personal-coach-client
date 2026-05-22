export const formatOccurrenceDate = (value: Date) =>
  value.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export const formatOccurrenceTime = (value: Date) =>
  value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateLabel = (value: string | null, emptyLabel = 'Any') => {
  if (!value) return emptyLabel;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatLongDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};
