import { Pool, PoolClient, QueryResult, QueryConfig } from 'pg';

interface ExtendedPoolClient extends PoolClient {
    lastQuery?: unknown;
}

class Database {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: false
            } : undefined
        });
    }

    async query(text: string, params?: any[]): Promise<QueryResult> {
        const start = Date.now();
        const res = await this.pool.query(text, params);
        const duration = Date.now() - start;

        if (process.env.NODE_ENV !== 'production') {
            console.log('executed query', { text, duration, rows: res.rowCount });
        }

        return res;
    }

    async getClient(): Promise<ExtendedPoolClient> {
        const client = await this.pool.connect() as ExtendedPoolClient;
        const query = client.query.bind(client);
        const release = client.release.bind(client);

        // Set a timeout of 5 seconds, after which we will log this client's last query
        const timeout = setTimeout(() => {
            console.error('A client has been checked out for more than 5 seconds!');
            console.error(`The last executed query on this client was: ${client.lastQuery}`);
        }, 5000);

        // Monkey patch the query method to keep track of the last query executed
        const wrappedQuery = async (queryTextOrConfig: string | QueryConfig, values?: any[]) => {
            client.lastQuery = { queryTextOrConfig, values };
            return query(queryTextOrConfig, values);
        };

        client.query = wrappedQuery as typeof client.query;

        client.release = () => {
            clearTimeout(timeout);
            client.query = query;
            client.release = release;
            return release();
        };

        return client;
    }
}

export const db = new Database(); 