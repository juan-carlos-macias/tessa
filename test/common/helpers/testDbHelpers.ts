/**
 * Test Database Helper Utilities
 * Provides database setup, teardown, and cleanup functions for tests
 */

import mongoose from 'mongoose';
import { app as dbConnection } from '../../../src/modules/db.module';

/**
 * Clean up all collections in the test database
 */
export async function cleanDatabase(): Promise<void> {
    const { collections } = dbConnection;

    await Promise.all(
        Object.values(collections).map((collection) =>
            collection.deleteMany({})
        )
    );
}

/**
 * Close all database connections
 */
export async function closeDatabase(): Promise<void> {
    await dbConnection.close();
}

/**
 * Create test data helper
 */
export async function createTestData<T>(
    model: mongoose.Model<T>,
    data: Partial<T> | Partial<T>[]
): Promise<any> {
    if (Array.isArray(data)) {
        return model.insertMany(data);
    }
    return model.create(data);
}

/**
 * Alias for cleanDatabase - used in some test patterns
 */
export const cleanUp = cleanDatabase;

/**
 * Test Database Services - provides common DB operations for tests
 */
export class TestDbServices {
    static async clean(): Promise<void> {
        await cleanDatabase();
    }

    static async close(): Promise<void> {
        await closeDatabase();
    }

    static async create<T>(
        model: mongoose.Model<T>,
        data: Partial<T> | Partial<T>[]
    ): Promise<any> {
        return createTestData(model, data);
    }
}
