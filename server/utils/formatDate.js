const { padNumber } = require('./index');

function formatDateInput(date) {
  if (!date) {
    return date;
  }

  const d = new Date(date);
  const year = d.getFullYear();
  const month = padNumber(d.getMonth() + 1, 2);
  const day = padNumber(d.getDate(), 2);

  return `${year}-${month}-${day}`;
}

module.exports = {
  formatDateYYYYMM(date) {
    const d = formatDateInput(date);
    return d ? d.slice(0, 7) : d;
  },
  formatDateInput,
  formatDateTimeInput(date) {
    if (!date) {
      return date;
    }

    return new Date(date).toISOString();
  }
};
