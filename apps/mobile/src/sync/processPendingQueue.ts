import { Q } from '@nozbe/watermelondb'; // operador de query
import { database } from '../database';
import { Inspecao } from '../database/models/Inspecao';

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
function toSyncPayload(inspecao: Inspecao): SyncPayload {
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
async function fetchPendingInspections(): Promise<Inspecao[]> {
    const collection = database.get<Inspecao>('inspecoes');

    return collection.query(Q.where('status_sync', 'pendente')).fetch();
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
    const collection = database.get<Inspecao>('inspecoes');

    await database.write(async () => {
        for (const id of result.sucesso) {
            const inspecao = await collection.find(id);
            await inspecao.update((record) => {
                record.statusSync = 'sincronizado';
                record.syncedAt = Date.now();
            })
        }
    })
    
}


export async function processPendingQueue(): Promise<void>  {
    const pending = await fetchPendingInspections(); // Buscer pendentes
 
    if(pending.length === 0) return; // nada para enviar 

    const payload = pending.map(toSyncPayload); // Converter para payload
    const result = await sendToServer(payload); // envia para o servidor 
    await applySyncResult(result); // Salvar resposta no WaterMelonDB
}