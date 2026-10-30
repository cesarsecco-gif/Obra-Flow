import type { RdoDiario } from '../types/rdo';

const DB_NAME = 'obraflow_db';
const DB_VERSION = 2;
const STORE_NAME = 'rdo_pendentes';
const STORE_DIARIOS = 'rdos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'idLocal', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_DIARIOS)) {
        const store = db.createObjectStore(STORE_DIARIOS, { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function salvarRdoLocal(dadosRdo: any): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item = {
      ...dadosRdo,
      criadoEm: new Date().toISOString(),
      sincronizado: false
    };
    const req = store.add(item);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function listarRdosPendentes(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function removerRdoSincronizado(idLocal: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(idLocal);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ---- RDOs completos por obra ----

export async function listarDiarios(projectId: string): Promise<RdoDiario[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DIARIOS, 'readonly');
    const req = tx.objectStore(STORE_DIARIOS).index('projectId').getAll(projectId);
    req.onsuccess = () => resolve((req.result as RdoDiario[]).sort((a, b) => b.numero - a.numero));
    req.onerror = () => reject(req.error);
  });
}

export async function salvarDiario(rdo: RdoDiario): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DIARIOS, 'readwrite');
    tx.objectStore(STORE_DIARIOS).put(rdo);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function excluirDiario(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DIARIOS, 'readwrite');
    tx.objectStore(STORE_DIARIOS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
