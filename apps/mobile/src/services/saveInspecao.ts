import { addInspecao } from '../storage/inspecaoStorage';
import type { InspecaoRecord } from '../storage/inspecaoTypes';
import * as Crypto from 'expo-crypto';

export type InspecaoFormData = {
    nomeImovel: string;
    endereco: string;
    areaM2: string;
    observacoes?: string;
}

function validateForm(form: InspecaoFormData): number{
    const area = Number(form.areaM2);

    if (!form.nomeImovel.trim()) {
        throw new Error('Informe o nome do imóvel.');
    }
    if (!form.endereco.trim()) {
        throw new Error('Informe o endereço.');
    }
    if (Number.isNaN(area) || area <= 0) {
        throw new Error('Informe uma área (m²) válida.');
    }

    return area;
}

export async function saveInspecao(form: InspecaoFormData): Promise<void> {
    const area = validateForm(form);

    const nova: InspecaoRecord = {
        id: Crypto.randomUUID(),
        nomeImovel: form.nomeImovel.trim(),
        endereco: form.endereco.trim(),
        areaM2: area,
        observacoes: form.observacoes?.trim() || undefined,
        statusSync: 'pendente',
        createdAt: Date.now(),
    }
    await addInspecao(nova);
}