import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { pool } from './db';
import { migrate } from './migrations/migrate';
import { inspecaoRouter } from './routes/inspecoes';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// saúde da aplicação

app.get('/health', async (_req, res) => {
    try{
        const result = await pool.query('SELECT NOW() as now');
        res.json({ok: true, db: result.rows[0].now});

    }catch(error){
        res.status(500).json({ok: false, error: 'DB connection failed'});
    }
})

app.use('/inspecoes', inspecaoRouter);


async function bootstrap(){
    await migrate();

    
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server is running on port ${port}`);
    });
}

bootstrap().catch((err) =>{
    console.error('Error starting the server:', err);
    process.exit(1);
});