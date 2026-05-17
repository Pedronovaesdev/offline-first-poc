import { Router } from 'express';
import { pool } from '../db';
import type { InspecaoSyncInput, SyncResponse } from '../types/inspecao';
import { validateInspecao } from '../services/validateInspecao';

export const inspecaoRouter = Router();

inspecaoRouter.post('/sync', async (req, res) => {
    const body = req.body;

    if(!Array.isArray(body)) {
        return res.status(400).json({ok: false, error: 'Payload deve ser um array'});
    } 

    const sucesso: string[] = [];
    const erros: string[] = [];

    for (const item of body as InspecaoSyncInput[]) {
        const validationError = validateInspecao(item);
        if (validationError) {
            erros.push(`${item.id}: ${validationError}`);
            continue;
        }

        try {
            const syncedAt = Date.now();

            await pool.query(
                `
                INSERT INTO inspecoes (
                id, nome_imovel, endereco, area_m2, observacoes,
                status_sync, created_at, synced_at
                )
                VALUES ($1, $2, $3, $4, $5, 'sincronizado', $6, $7)
                ON CONFLICT (id) DO UPDATE SET
                nome_imovel = EXCLUDED.nome_imovel,
                endereco = EXCLUDED.endereco,
                area_m2 = EXCLUDED.area_m2,
                observacoes = EXCLUDED.observacoes,
                status_sync = 'sincronizado',
                created_at = EXCLUDED.created_at,
                synced_at = EXCLUDED.synced_at
                `,
                [
                    item.id,
                    item.nome_imovel.trim(),
                    item.endereco.trim(),
                    item.area_m2,
                    item.observacoes ?? null,
                    item.created_at,
                    syncedAt,
                ],
            );
            sucesso.push(item.id);
            console.log(`Inspecao ${item.id} sincronizada com sucesso`);
        } catch (error) {
            erros.push(`${item.id}: Erro ao inserir no banco de dados: ${error}`);
        }
    }

    const response: SyncResponse = { sucesso, erros };
    return res.json(response);
})