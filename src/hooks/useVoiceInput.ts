import { useState, useRef } from 'react';
import { Audio } from 'expo-av';

export const useVoiceInput = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [uri, setUri] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') return;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recordingRef.current = recording;
    setIsRecording(true);
  };

  const stopRecording = async (): Promise<string | null> => {
    if (!recordingRef.current) return null;
    await recordingRef.current.stopAndUnloadAsync();
    const fileUri = recordingRef.current.getURI();
    recordingRef.current = null;
    setIsRecording(false);
    setUri(fileUri);
    return fileUri;
  };

  return { isRecording, uri, startRecording, stopRecording };
};
