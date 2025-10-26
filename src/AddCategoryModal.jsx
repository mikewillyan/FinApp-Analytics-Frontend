// -----------------------------------------------------------
// Componente: AddCategoryModal.jsx
// Descrição: Modal para criar nova categoria (reutilizável)
// -----------------------------------------------------------
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const AddCategoryModal = ({ onSave, onCancel, isSaving }) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      setError('O nome da categoria é obrigatório.');
      return;
    }

    if (!tipo) {
      setError('Selecione o tipo da categoria.');
      return;
    }

    setError(null);
    onSave({ nome, tipo, cor_hexa: null }); // cor opcional
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Adicionar Nova Categoria</h2>
          <button onClick={onCancel} className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Corpo */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-1">
              Nome da Categoria
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Alimentação"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              disabled={isSaving}
              required
            />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-semibold text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              disabled={isSaving}
              required
            >
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </select>
          </div>

          {/* Rodapé */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
                isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="inline animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Adicionar Categoria'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
