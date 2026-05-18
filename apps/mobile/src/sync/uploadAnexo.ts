import type { AnexoRecord } from "../storage/anexoTypes";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// envio de anexo por partes
export function uploadAnexo(
    anexo: AnexoRecord,
    onProgress: (percent: number) => void,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        formData.append('file', {
            uri: anexo.localUri,
            name: anexo.fileName,
            type: anexo.mimeType,
        } as unknown as Blob);

        formData.append('anexoId', anexo.id);
        formData.append('inspecaoId', anexo.inspecaoId);

        // barra de progresso
        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
        }

        // resposta da api
        xhr.onload = () => {
            if (xhr.status === 200 && xhr.status < 300) {
                onProgress(100);
                resolve();
                return;
            } 
            reject(new Error(`Erro ao enviar anexo: ${xhr.statusText}`));
        };

        xhr.onerror = () => {
            reject(new Error('Erro ao enviar anexo: ' + xhr.statusText));
        }

        xhr.ontimeout = () => {
            reject(new Error('Tempo de espera excedido'));
        };

        xhr.open('POST', `${API_URL}/anexos/upload`, true);
        xhr.timeout = 120_000; // 30 segundos
        xhr.send(formData);
    })
}