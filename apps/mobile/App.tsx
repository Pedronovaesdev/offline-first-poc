import React from 'react';
import { View } from 'react-native';

import { useNetworkSync } from './src/hooks/useNetworkSync';
import { FormInspecaoScreen } from './src/screens/FormInspecaoScreen';
import { ListaInspecoesScreen } from './src/screens/ListaInspecoesScreen';

import { useState } from 'react';

export default function App() {
    const { runSync } = useNetworkSync();
    const [listVersion, setListVersion] = useState(0);

    async function handleSaved(){
      setListVersion((v) => v + 1);
      await runSync();
      setListVersion((v) => v + 1);
    }
    
    return (
      <View style={{ flex: 1 }}>
        <FormInspecaoScreen onSaved={handleSaved} />
        <ListaInspecoesScreen refreshKey={listVersion} />
      </View>
    );
  }