import React from 'react';

import { useNetworkSync } from './src/hooks/useNetworkSync';
import { FormInspecaoScreen } from './src/screens/FormInspecaoScreen';

export default function App() {
  useNetworkSync();

  return <FormInspecaoScreen />;
}

