export const getAthensDate = (date) => {
  if (!date) return null;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Athens',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const val = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      val[part.type] = parseInt(part.value, 10);
    }
  }
  return new Date(val.year, val.month - 1, val.day, val.hour, val.minute, val.second);
};
