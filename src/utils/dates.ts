export const getYYYYMMDD = (date: Date) => {
  const year = date.getUTCFullYear();
  let month = String(date.getUTCMonth() + 1);
  let day = String(date.getUTCDate());

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }
  return `${year}-${month}-${day}`;
}
