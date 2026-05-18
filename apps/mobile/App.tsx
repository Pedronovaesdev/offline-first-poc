import React from 'react';
import { View } from 'react-native';

import { useNetworkSync } from './src/hooks/useNetworkSync';
import { FormInspecaoScreen } from './src/screens/FormInspecaoScreen';
import { ListaInspecoesScreen } from './src/screens/ListaInspecoesScreen';
import { useUploadQueue } from './src/hooks/useUploadQueue';
import { AnexosInspecaoScreen } from './src/screens/AnexosInspecaoScreen';
import type { InspecaoRecord } from './src/storage/inspecaoTypes';

import { useState } from 'react';

export default function App() {
    const { runSync } = useNetworkSync();
    const [listVersion, setListVersion] = useState(0);
    const { runUpload, progress, currentAnexoId, uploadStatus } = useUploadQueue();
    const [selectedInspecao, setSelectedInspecao] = useState<InspecaoRecord | null>(null);

    async function handleSaved(){
      setListVersion((v) => v + 1);
      await runSync();
      setListVersion((v) => v + 1);
    }

    async function handleAnexoAdded() {
      setListVersion((v) => v + 1);
      await runUpload();
      setListVersion((v) => v + 1);
    }
    
    if (selectedInspecao) {
      return (
        <AnexosInspecaoScreen
          inspecaoId={selectedInspecao.id}
          nomeImovel={selectedInspecao.nomeImovel}
          onBack={() => setSelectedInspecao(null)}
          refreshKey={listVersion}
          currentAnexoId={currentAnexoId}
          uploadProgress={progress}
          uploadStatus={uploadStatus}
          onAnexoAdded={handleAnexoAdded}
        />
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <FormInspecaoScreen onSaved={handleSaved} />
        <ListaInspecoesScreen
          refreshKey={listVersion}
          onOpenAnexos={setSelectedInspecao}
        />
      </View>
    );
  }