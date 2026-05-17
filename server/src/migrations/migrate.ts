import fs from 'fs';
import path from 'path';
import { pool } from '../db';

export async function migrate(){
    const sqlPath = path.resolve(__dirname, '../../sql/001_create_inspecoes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('Migration completed successfully');
}