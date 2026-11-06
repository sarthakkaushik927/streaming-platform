export const extractYouTubeVideoId = (input: string): string => {
  if (!input) return '8vnrqEudzWQ';
  const trimmed = input.trim();

  // If it's already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle standard youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  return trimmed;
};
