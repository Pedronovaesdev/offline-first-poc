import { Router } from 'express';
import { pool } from '../db';
import { uploadMiddleware } from '../middleware/upload';

export const anexoRouter = Router();

anexoRouter.post(
  '/upload',
  uploadMiddleware.single('file'), // campo "file" = igual ao mobile
  async (req, res) => {
    try {
      const { anexoId, inspecaoId } = req.body;

      console.log('[upload] Requisição recebida:', {
        anexoId,
        inspecaoId,
        arquivo: req.file
          ? `${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`
          : 'nenhum',
      });

      if (!anexoId || !inspecaoId) {
        return res.status(400).json({ ok: false, error: 'anexoId e inspecaoId obrigatórios' });
      }

      if (!req.file) {
        return res.status(400).json({ ok: false, error: 'Arquivo obrigatório (campo file)' });
      }

      // Inspeção precisa existir (regra da etapa 3)
      const inspecao = await pool.query(
        'SELECT id FROM inspecoes WHERE id = $1',
        [inspecaoId],
      );
      if (inspecao.rowCount === 0) {
        return res.status(404).json({ ok: false, error: 'Inspeção não encontrada' });
      }

      const syncedAt = Date.now();

      await pool.query(
        `
        INSERT INTO anexos (
          id, inspecao_id, file_name, mime_type, storage_path, created_at, synced_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          file_name = EXCLUDED.file_name,
          mime_type = EXCLUDED.mime_type,
          storage_path = EXCLUDED.storage_path,
          synced_at = EXCLUDED.synced_at
        `,
        [
          anexoId,
          inspecaoId,
          req.file.originalname,
          req.file.mimetype,
          req.file.path,
          syncedAt,
          syncedAt,
        ],
      );

      console.log(`Anexo ${anexoId} salvo para inspeção ${inspecaoId}`);
      return res.status(200).json({ ok: true, id: anexoId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ ok: false, error: 'Erro ao salvar anexo' });
    }
  },
);