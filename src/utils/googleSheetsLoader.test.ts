import { test, describe } from 'node:test';
import assert from 'node:assert';
import { googleSheetsLoader } from './googleSheetsLoader.ts';

describe('googleSheetsLoader', () => {
    describe('load', () => {
        test('should throw an error when fetch fails (HTTP not ok)', async (t) => {
            const loader = googleSheetsLoader();
            const mockStore = { clear: () => {}, set: () => {} };

            t.mock.method(globalThis, 'fetch', async () => {
                return {
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                };
            });

            await assert.rejects(
                async () => {
                    await loader.load({ store: mockStore });
                },
                (err: Error) => {
                    assert.strictEqual(err.message, 'Failed to fetch events: 500 Internal Server Error');
                    return true;
                }
            );
        });

        test('should throw an error when API returns status error', async (t) => {
            const loader = googleSheetsLoader();
            const mockStore = { clear: () => {}, set: () => {} };

            t.mock.method(globalThis, 'fetch', async () => {
                return {
                    ok: true,
                    json: async () => ({
                        status: 'error',
                        message: 'Custom API error message',
                    }),
                };
            });

            await assert.rejects(
                async () => {
                    await loader.load({ store: mockStore });
                },
                (err: Error) => {
                    assert.strictEqual(err.message, 'Google Script returned error: Custom API error message');
                    return true;
                }
            );
        });
    });
});
