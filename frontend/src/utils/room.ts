export const extractRoomId = (input: string): string => {
  if (!input) return '';
  const trimmed = input.trim();

  // If input contains full URL path /room/ROOM_ID
  if (trimmed.includes('/room/')) {
    const parts = trimmed.split('/room/');
    const lastSegment = parts[parts.length - 1];
    return lastSegment.split('?')[0].split('#')[0].replace(/\/+$/, '');
  }

  return trimmed;
};
