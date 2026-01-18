import { getStore } from '@netlify/blobs';

export async function handler(event, context) {
    try {
        // abre o store "tracks" (crie o mesmo nome no upload)
        const store = getStore('tracks');

        // pega todas as chaves do store
        const keys = await store.list();

        // busca cada track individualmente
        const trackPromises = keys.map(async (key) => {
            const data = await store.get(key);
            return JSON.parse(data);
        });

        const tracks = await Promise.all(trackPromises);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tracks),
        };

    } catch (error) {
        console.error('Error fetching tracks:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch tracks' }),
        };
    }
}
