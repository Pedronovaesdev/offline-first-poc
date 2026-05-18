import { useEffect, useState, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { processPendingUploadQueue } from "../sync/processPedingUploadQueue";

export type UploadQueueStatus = 'idle' | 'uploading' | 'error';

export function useUploadQueue() {
    const [isOnline, setIsOnline] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadQueueStatus>('idle');
  const [progress, setProgress] = useState(0);           // 0–100 do arquivo atual
  const [currentAnexoId, setCurrentAnexoId] = useState<string | null>(null);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);
      setUploadStatus(online ? 'idle' : 'error');
    });
    return () => unsubscribe();
  }, []);
  const runUpload = useCallback(async () => {
    try {
      setUploadStatus('uploading');
      setProgress(0);
      setCurrentAnexoId(null);
      await processPendingUploadQueue((anexoId, percent) => {
        setCurrentAnexoId(anexoId);
        setProgress(percent);
      });
    } catch (error) {
      console.error('Erro na fila de upload:', error);
    } finally {
      setUploadStatus(isOnline ? 'idle' : 'error');
      setProgress(0);
      setCurrentAnexoId(null);
    }
  }, [isOnline]);
  // Quando a rede volta, processa fila de anexos
  useEffect(() => {
    if (!isOnline) return;
    runUpload();
  }, [isOnline, runUpload]);
  return {
    isOnline,
    uploadStatus,   // 'offline' | 'idle' | 'uploading'
    progress,       // para a barra na tela de anexos
    currentAnexoId, // qual item está subindo agora
    runUpload,      // chamar manualmente após anexar arquivo (online)
  };
}