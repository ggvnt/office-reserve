import {Pool} from 'pg';

const globalForDb = global as unknown as { 
    _pgPool?: Pool 
};

export const db =
    globalForDb._pgPool ??= new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectionTimeoutMillis: 5000,
    });

if (process.env.NODE_ENV !== 'production') globalForDb._pgPool = db;