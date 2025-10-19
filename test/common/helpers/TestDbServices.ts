import mongoose from 'mongoose';
import config from 'config';

const mongodb = mongoose.mongo;
const MONGODB_URI: string = config.get('mongodb.uri');

class TestDbServices {
    private client;

    private db: mongoose.mongo.Db | null = null;

    constructor() {
        this.client = new mongodb.MongoClient(MONGODB_URI);
    }

    private async ensureConnection(): Promise<void> {
        if (!this.client) {
            await this.client.connect();
        }
    }

    async createDb(dbName: string, collection: string): Promise<any | null> {
        await this.ensureConnection();

        if (this.db?.databaseName === dbName) {
            return this.db;
        }

        this.db = this.client.db(dbName);

        const collections = await this.db?.listCollections().toArray();
        const collectionExists = collections?.some(
            (col) => col.name === collection
        );

        if (!collectionExists) {
            await this.db?.createCollection(collection);
        }

        return this.db;
    }

    async connect(dbName: string): Promise<any | null> {
        await this.ensureConnection();

        if (this.db?.namespace === dbName) {
            return this.db;
        }

        this.db = this.client.db(dbName);
        const collections: (
            | mongoose.mongo.CollectionInfo
            | Pick<mongoose.mongo.CollectionInfo, 'name' | 'type'>
        )[] = (await this.db?.listCollections().toArray()) ?? [];
        if (collections.length === 0) {
            throw new Error(
                `Database '${dbName}' does not exist or has no collections`
            );
        }
        return this.db;
    }

    async getDb(dbName: string): Promise<mongoose.mongo.Db | null> {
        await this.ensureConnection();

        if (this.db && this.db.databaseName === dbName) {
            return this.db;
        }

        this.db = this.client.db(dbName);
        return this.db;
    }

    async close(): Promise<void> {
        await this.ensureConnection();

        const dbs = await this.client.db().admin().listDatabases();
        const databasesToDrop = dbs.databases.filter(
            (dbInfo) => !['admin', 'local', 'config'].includes(dbInfo.name)
        );
        const dropDatabasePromises = databasesToDrop.map(async (dbInfo) => {
            const db = this.client.db(dbInfo.name);
            try {
                await db.dropDatabase();
            } catch (err: any) {
                throw new Error(
                    `Error dropping database ${dbInfo.name}: ${err.message}`
                );
            }
        });

        try {
            await Promise.all(dropDatabasePromises);
            await this.client.close();
        } catch (err: any) {
            throw new Error(`Error closing MongoDB connection: ${err.message}`);
        }
    }
}

export default new TestDbServices();
