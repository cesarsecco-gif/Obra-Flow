import React, { useState } from 'react';
import { useRDOOffline } from '../hooks/useRDOOffline';
import { comprimirImagem } from '../services/imageUtils';
import { RDOItem, CondicaoClimatica, TurnoTrabalho } from '../types/rdo';

export const RDOForm: React.FC = () => {
  const { online, pendentes, gravarRDO, sincronizando, forcarSincronizacao } = useRDOOffline();

  const [numeroRdo, setNumeroRdo] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [turno, setTurno] = useState<TurnoTrabalho>('integral');
  const [climaManha, setClimaManha] = useState<CondicaoClimatica>('bom');
  const [climaTarde, setClimaTarde] = useState<CondicaoClimatica>('bom');
  const [condicaoTrecho, setCondicaoTrecho] = useState<'praticavel' | 'impraticavel' | 'parcial'>('praticavel');
  const [observacoes, setObservacoes] = useState('');
  const [fotos, setFotos] = useState<{ id: string; urlBlob: string; descricao: string; timestamp: string }[]>([]);
  const [salvando, setSalvando] = useState(false);

  const handleCapturaFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const arquivo = e.target.files[0];

    try {
      const blobComprimido = await comprimirImagem(arquivo, 1280, 0.7);
      const urlPreview = URL.createObjectURL(blobComprimido);
      
      setFotos(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          urlBlob: urlPreview,
          descricao: `Evidência capturada às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      alert('Erro ao comprimir imagem do estaleiro.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroRdo) return alert('Informe o número do RDO');
    setSalvando(true);

    try {
      await gravarRDO({
        numeroRdo,
        data,
        turno,
        climaManha,
        climaTarde,
        condicaoTrecho,
        efetivo: [],
        equipamentos: [],
        servicos: [],
        fotos,
        observacoesFiscais: observacoes,
      });

      alert(online ? 'RDO gravado e sincronizado!' : 'RDO guardado localmente (Offline). Será sincronizado ao reconectar.');
      setNumeroRdo('');
      setObservacoes('');
      setFotos([]);
    } catch (err) {
      alert('Erro ao guardar o RDO localmente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans">
      <div className={`flex justify-between items-center p-3 rounded-lg mb-5 font-semibold ${
        online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <span>Status: {online ? 'Conectado à Rede' : 'Modo Offline (Armazenamento Local)'}</span>
        <span className="flex items-center gap-2">
          Pendentes: {pendentes.length}
          {online && pendentes.length > 0 && (
            <button
              onClick={() => forcarSincronizacao()}
              disabled={sincronizando}
              className="ml-2 px-2 py-1 text-sm bg-white border border-current rounded cursor-pointer"
            >
              {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          )}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">Registo Diário de Obra (RDO)</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Número do RDO</label>
            <input
              type="text"
              required
              value={numeroRdo}
              onChange={e => setNumeroRdo(e.target.value)}
              placeholder="Ex: RDO-2026-001"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Turno</label>
            <select
              value={turno}
              onChange={e => setTurno(e.target.value as TurnoTrabalho)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="integral">Integral</option>
              <option value="noite">Noite</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Clima (Manhã)</label>
            <select
              value={climaManha}
              onChange={e => setClimaManha(e.target.value as CondicaoClimatica)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="bom">Bom (Ensolarado)</option>
              <option value="nublado">Nublado</option>
              <option value="chuva_leve">Chuva Leve</option>
              <option value="chuva_forte">Chuva Forte</option>
              <option value="impraticavel">Impraticável</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Clima (Tarde)</label>
            <select
              value={climaTarde}
              onChange={e => setClimaTarde(e.target.value as CondicaoClimatica)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="bom">Bom (Ensolarado)</option>
              <option value="nublado">Nublado</option>
              <option value="chuva_leve">Chuva Leve</option>
              <option value="chuva_forte">Chuva Forte</option>
              <option value="impraticavel">Impraticável</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Condição da Pista/Trecho</label>
            <select
              value={condicaoTrecho}
              onChange={e => setCondicaoTrecho(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="praticavel">Praticável</option>
              <option value="parcial">Parcialmente Praticável</option>
              <option value="impraticavel">Impraticável</option>
            </select>
          </div>
        </div>

        <fieldset className="border border-gray-300 rounded-lg p-3">
          <legend className="font-semibold text-sm px-1 text-gray-700">Evidências e Registo Fotográfico</legend>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapturaFoto}
            className="mb-3 block text-sm text-gray-600"
          />

          <div className="flex gap-3 flex-wrap">
            {fotos.map(foto => (
              <div key={foto.id} className="w-28 text-center">
                <img
                  src={foto.urlBlob}
                  alt={foto.descricao}
                  className="w-full h-20 object-cover rounded shadow"
                />
                <span className="text-[10px] text-gray-500 block truncate mt-1">{foto.descricao}</span>
              </div>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Observações da Fiscalização</label>
          <textarea
            rows={4}
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            placeholder="Apontamentos de paralisação, motivos de atraso ou ocorrências do dia..."
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="p-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {salvando ? 'A Gravar...' : 'Gravar Diário de Obra'}
        </button>
      </form>
    </div>
  );
};
