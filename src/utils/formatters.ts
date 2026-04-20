export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

export const celsiusToFahrenheit = (c: number): number => +(c * 9 / 5 + 32).toFixed(1);
export const fahrenheitToCelsius = (f: number): number => +((f - 32) * 5 / 9).toFixed(1);
