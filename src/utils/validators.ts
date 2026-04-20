export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone: string): boolean =>
  /^(\+91)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));

export const isValidPassword = (password: string): boolean => password.length >= 6;

export const isValidTemperature = (temp: number, unit: 'C' | 'F'): boolean => {
  if (unit === 'C') return temp >= 30 && temp <= 45;
  return temp >= 86 && temp <= 113;
};
