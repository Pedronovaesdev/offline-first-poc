import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const schema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'inspecoes',
            columns: [
                {name: 'nome_imovel', type: 'string'},
                {name: 'endereco', type: 'string'},
                {name: 'area_m2', type: 'number'},
                {name: 'observacoes', type: 'string', isOptional: true},
                {name: 'status_sync', type: 'string'},
                {name: 'created_at', type: 'number'},
                {name: 'synced_at', type: 'number', isOptional: true},
            ]
        })
    ]
})