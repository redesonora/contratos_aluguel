// Helper robusto em IndexedDB nativo para armazenar backups sem restrição de quota do localStorage (suporta centenas de MBs)

const DB_NAME = 'RealizzeSystemBackupDB';
const DB_VERSION = 1;
const STORE_NAME = 'restore_points';

export interface StoredRestorePoint {
  id: string;
  label: string;
  createdAt: string;
  summary: {
    totalImoveis: number;
    totalProprietarios: number;
    totalInquilinos: number;
    totalContratos: number;
    totalPagamentos: number;
    totalTemplates: number;
  };
  payload: any;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Erro ao abrir IndexedDB.'));
    };
  });
}

export async function saveRestorePointToIDB(point: StoredRestorePoint): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(point);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('Erro ao gravar ponto no IndexedDB.'));
      tx.oncomplete = () => db.close();
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

export async function getAllRestorePointsFromIDB(): Promise<StoredRestorePoint[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const list: StoredRestorePoint[] = req.result || [];
          // Ordena do mais recente para o mais antigo
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          resolve(list);
        };
        req.onerror = () => reject(req.error || new Error('Erro ao ler pontos do IndexedDB.'));
        tx.oncomplete = () => db.close();
      } catch (err) {
        db.close();
        reject(err);
      }
    });
  } catch (err) {
    console.warn('Falha ao recuperar pontos do IndexedDB:', err);
    return [];
  }
}

export async function deleteRestorePointFromIDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('Erro ao deletar ponto do IndexedDB.'));
      tx.oncomplete = () => db.close();
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

export async function clearOldRestorePointsFromIDB(keepCount: number = 20): Promise<void> {
  try {
    const points = await getAllRestorePointsFromIDB();
    if (points.length > keepCount) {
      const toDelete = points.slice(keepCount);
      for (const p of toDelete) {
        await deleteRestorePointFromIDB(p.id).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('Erro ao limpar pontos antigos:', e);
  }
}
