import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

// A (!) -> definine que o campo é obrigatório 
// ? -> definine que o campo é opcional
export class Inspecao extends Model {
    static table = 'inspecoes';

    @field('nome_imovel') nomeImovel!: string;
    @field('endereco') endereco!: string;
    @field('area_m2') areaM2!: number;
    @field('observacoes') observacoes?: string;
    
    @field('status_sync') statusSync!: string;
    @field('created_at') createdAt!: number;
    @field('synced_at') syncedAt?: number;
}