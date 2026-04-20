import * as LocalAuthentication from 'expo-local-authentication';

export const useBiometric = () => {
  const authenticate = async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) return true; // Fallback if no biometrics

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access CareAI',
      fallbackLabel: 'Use Passcode',
    });

    return result.success;
  };

  return { authenticate };
};
