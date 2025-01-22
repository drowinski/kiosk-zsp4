export const getYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  let month = String(date.getMonth() + 1);
  let day = String(date.getDate());

  if (month.length < 2) {
    month = '0' + month;
  }
  if (day.length < 2) {
    day = '0' + day;
  }
  return `${year}-${month}-${day}`;
}
