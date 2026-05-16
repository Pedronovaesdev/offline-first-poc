import { useEffect, useState, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { processPendingQueue } from "../sync/processPendingQueue";

// Estado que vai ser exibido na UI
// sem rede | com rede mais parado | sincronizando
export type SyncUiStatus = 'offline' | 'idle' | 'syncing';

export function useNetworkSync() {
    const [isOnline, setIsOnline] = useState(false);
    const [syncStatus, setSyncStatus] = useState<SyncUiStatus>('idle');

    useEffect(() => {
        // lê o estado atual assim que o hook é carregado
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOnline(state.isConnected ?? false);
            setSyncStatus(state.isConnected ? 'idle' : 'offline');
        });

        // limpa ao desmontar 
        return () => unsubscribe();
    }, []);

   const runSync = useCallback(async () => {
    try {
        setSyncStatus('syncing');
        await processPendingQueue();
    } catch (error) {
        console.error('Erro ao sincronizar:', error);
    } finally {
        setSyncStatus(isOnline ? 'idle' : 'offline');
    }
   }, [isOnline]); // chamada da api

   useEffect(() => {
    if(!isOnline) return; // se não estiver online, não chama API

    runSync();
   }, [isOnline, runSync]);

    return {
        isOnline,
        syncStatus,
        runSync,
    }
}