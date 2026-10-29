import { useState, useEffect, useCallback } from 'react';
import { RDOItem } from '../types/rdo';
import { salvarRdoLocal, listarRdosPendentes, removerRdoSincronizado } from '../services/storage';

export function useRDOOffline() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [pendentes, setPendentes] = useState<RDOItem[]>([]);
  const [sincronizando, setSincronizando] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const carregarPendentes = useCallback(async () => {
    try {
      const lista = await listarRdosPendentes();
      setPendentes(lista);
    } catch (err) {
      console.error('Erro ao ler do IndexedDB:', err);
    }
  }, []);

  useEffect(() => {
    carregarPendentes();
  }, [carregarPendentes]);

  const sincronizarFila = useCallback(async () => {
    if (!navigator.onLine || sincronizando) return;
    setSincronizando(true);

    try {
      const fila = await listarRdosPendentes();
      for (const item of fila) {
        const resposta = await fetch('/api/rdos/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });

        if (resposta.ok && item.idLocal) {
          await removerRdoSincronizado(item.idLocal);
        }
      }
      await carregarPendentes();
    } catch (erro) {
      console.warn('Sincronização em segundo plano postergada:', erro);
    } finally {
      setSincronizando(false);
    }
  }, [sincronizando, carregarPendentes]);

  const gravarRDO = async (dados: Omit<RDOItem, 'idLocal' | 'criadoEm' | 'sincronizado'>) => {
    const idLocal = await salvarRdoLocal(dados);
    await carregarPendentes();
    if (navigator.onLine) {
      sincronizarFila();
    }
    return idLocal;
  };

  useEffect(() => {
    if (online) {
      sincronizarFila();
    }
  }, [online, sincronizarFila]);

  return {
    online,
    pendentes,
    sincronizando,
    gravarRDO,
    forcarSincronizacao: sincronizarFila,
  };
}
