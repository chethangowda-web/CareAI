import api from './api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const downloadReport = async (recordId: string): Promise<void> => {
  const { data } = await api.get(`/reports/${recordId}`);
  const { url } = data; // presigned S3 URL
  const localUri = `${FileSystem.documentDirectory}careai_report_${recordId}.pdf`;
  await FileSystem.downloadAsync(url, localUri);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(localUri, { mimeType: 'application/pdf', dialogTitle: 'Share CareAI Report' });
  }
};
