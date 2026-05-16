import { Database } from '@nozbe/watermelondb'; // classe principal do WaterMelonDB
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'; // adapter para SQLite

import { schema } from './schema';
import { Inspecao } from './models/Inspecao';

const adapter = new SQLiteAdapter({
    schema,
    dbName: 'inspecoes_offline',
    jsi: true,
    onSetUpError: (error) => {
        console.error('Erro ao configurar o banco de dados:', error);
        throw error;
    }
})

export const database = new Database({
    adapter,
    modelClasses: [Inspecao],
});