/**
 * Unit-test stub for @whiskeysockets/baileys (ESM-only package).
 * ts-jest runs in CommonJS mode; this stub prevents "Cannot use import statement outside a module"
 * when any source file importing baileys is pulled into the unit test graph.
 * The e2e boot gate uses jest.mock() inline instead (test/baileys-engine.e2e-spec.ts).
 */
export default jest.fn();
export const useMultiFileAuthState = jest.fn();
export const fetchLatestBaileysVersion = jest.fn();
export const getContentType = jest.fn();
export const DisconnectReason = { loggedOut: 401 };
