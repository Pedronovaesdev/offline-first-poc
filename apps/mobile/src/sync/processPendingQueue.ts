import {
    getPendingInspecoes,
    updateInspecao,
  } from '../storage/inspecaoStorage';
import type { InspecaoRecord } from '../storage/inspecaoTypes';
import { loadInspecoes } from '../storage/inspecaoStorage';


const API_URL = 'http://localhost:3000';

type SyncPayload = {
    id: string;
    nome_imovel: string;
    endereco: string;
    area_m2: number;
    observacoes?: string;
    status_sync: string;
    created_at: number;
    synced_at?: number;
};

// Converte o modelo do banco de dados para o payload da API
function toSyncPayload(inspecao: InspecaoRecord): SyncPayload {
    return {
        id: inspecao.id,
        nome_imovel: inspecao.nomeImovel,
        endereco: inspecao.endereco,
        area_m2: inspecao.areaM2,
        observacoes: inspecao.observacoes,
        status_sync: inspecao.statusSync,
        created_at: inspecao.createdAt,
        synced_at: inspecao.syncedAt,
    }
}

// buscar pendentes no sqllite
async function fetchPendingInspections(): Promise<InspecaoRecord[]> {
    return getPendingInspecoes();
}

type SyncResponse = {
    sucesso: string[];
    erros: string[];
}

async function sendToServer(payload: SyncPayload[]): Promise<SyncResponse> {
    const response = await fetch(`${API_URL}/inspecoes/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if(!response.ok) {
        throw new Error(`'Erro ao enviar para o servidor', ${response.statusText}`);
    }

    return response.json();
}

// Salvar Resposta no WaterMelonDB
async function applySyncResult(result: SyncResponse ): Promise<void> {

    for (const id of result.sucesso) {
        const list = await loadInspecoes(); // ou carregar uma vez fora do loop (otimização depois)
        const item = list.find((i) => i.id === id);
        if (!item) continue;
        await updateInspecao({
          ...item,
          statusSync: 'sincronizado',
          syncedAt: Date.now(),
        });
      }
    
}


export async function processPendingQueue(): Promise<void>  {
    const pending = await fetchPendingInspections(); // Buscer pendentes
 
    if(pending.length === 0) return; // nada para enviar 

    const payload = pending.map(toSyncPayload); // Converter para payload
    const result = await sendToServer(payload); // envia para o servidor 
    await applySyncResult(result); // Salvar resposta no WaterMelonDB
}