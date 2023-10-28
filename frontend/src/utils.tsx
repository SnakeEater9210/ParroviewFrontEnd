export default function formatDate(timestamp: string) {
  let date = new Date(timestamp);

  let formattedDate =
    date.getUTCFullYear() +
    '-' +
    ('0' + (date.getUTCMonth() + 1)).slice(-2) +
    '-' +
    ('0' + date.getUTCDate()).slice(-2) +
    ' ' +
    ('0' + date.getUTCHours()).slice(-2) +
    ':' +
    ('0' + date.getUTCMinutes()).slice(-2);

  return formattedDate;
}
