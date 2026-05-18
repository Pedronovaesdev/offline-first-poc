import fs from 'fs';
import path from 'path';
import { pool } from '../db';

export async function migrate(){
    const files = ['001_create_inspecoes.sql', '002_create_anexos.sql'];
    for (const file of files) {
        const sqlPath = path.resolve(__dirname, '../../sql', file);
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sql);
        console.log(`Migration ${file} OK`);
    }
    console.log('Migration completed successfully');
}