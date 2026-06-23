import { useState, useEffect } from 'react';

function formatDateTime(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const day = days[date.getDay()];
  const month = months[date.getMonth()];
  const dd = date.getDate();
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${day}, ${month} ${dd} ${yyyy}  ${hh}:${mm}:${ss}`;
}

export function useDateTime() {
  const [dateTime, setDateTime] = useState(() => formatDateTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => setDateTime(formatDateTime(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return dateTime;
}
