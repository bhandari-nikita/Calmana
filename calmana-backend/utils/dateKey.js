//calmana-backend/utils/dateKey.js
// function getDateKey(date = new Date()) {
//   const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
//   const istDate = new Date(date.getTime() + IST_OFFSET_MS);
//   return istDate.toISOString().slice(0, 10);
// }

// module.exports = getDateKey;

function getISTDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // YYYY-MM-DD
}

module.exports = getISTDateKey;

