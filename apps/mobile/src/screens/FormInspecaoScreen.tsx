import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
  } from 'react-native';
  import { saveInspecao, InspecaoFormData } from '../services/saveInspecao';

const emptyForm: InspecaoFormData = {
    nomeImovel: '',
    endereco: '',
    areaM2: '',
    observacoes: '',
}

export function FormInspecaoScreen() {
    const [form, setForm] = useState<InspecaoFormData>(emptyForm);
    const [saving, setSaving] = useState(false);

    function updateField<K extends keyof InspecaoFormData> (
        key: K, value: InspecaoFormData[K]
    ){
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    async function handleSave(){
        try{
            setSaving(true);
            await saveInspecao(form);
            setForm(emptyForm)
            Alert.alert('Sucesso', 'Informações salvas com sucesso');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao salvar.';
            Alert.alert('Erro', message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Nova inspeção</Text>
      <Text style={styles.label}>Nome do imóvel</Text>
      <TextInput
        style={styles.input}
        value={form.nomeImovel}
        onChangeText={(v) => updateField('nomeImovel', v)}
        placeholder="Ex.: Apartamento 302"
      />
      <Text style={styles.label}>Endereço</Text>
      <TextInput
        style={styles.input}
        value={form.endereco}
        onChangeText={(v) => updateField('endereco', v)}
        placeholder="Rua, número, bairro"
      />

    <Text style={styles.label}>Área (m²)</Text>
      <TextInput
        style={styles.input}
        value={form.areaM2}
        onChangeText={(v) => updateField('areaM2', v)}
        placeholder="Ex.: 85"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Observações (opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={form.observacoes ?? ''}
        onChangeText={(v) => updateField('observacoes', v)}
        placeholder="Rachadura na sala..."
        multiline
      />

      <Button
        title={saving ? 'Salvando...' : 'Salvar inspeção'}
        onPress={handleSave}
        disabled={saving}
      />
    </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 8 },
    title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
    label: { fontSize: 14, fontWeight: '500' },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
  });