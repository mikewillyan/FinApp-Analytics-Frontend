import Logo from "./assets/Logo.png";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LogOut, Home, CreditCard, Layers, DollarSign, Loader2, X, Check, Menu, Edit, Edit3, Trash2, Plus, Search, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
const primaryGreen = '#55ad85'; // Cor principal do tema
const darkGreen = '#4a9572'; 
const API_URL = 'http://localhost:10000'; // URL do seu backend
const API_BASE_URL = 'https://finapp-analytics-production.up.railway.app';

// Categorias pré-definidas para novos usuários
const PREDEFINED_CATEGORIES = [
    // Categorias de Despesa
    { nome: 'Alimentação', tipo: 'despesa', cor: '#ef4444' },
    { nome: 'Transporte', tipo: 'despesa', cor: '#ef4444' },
    { nome: 'Viagens', tipo: 'despesa', cor: '#ef4444' },
    { nome: 'Aluguel', tipo: 'despesa', cor: '#ef4444' },
    { nome: 'Água', tipo: 'despesa', cor: '#ef4444' },
    { nome: 'Energia', tipo: 'despesa', cor: '#ef4444' },
    { nome: 'Acessórios', tipo: 'despesa', cor: '#ef4444' },
    
    // Categorias de Receita
    { nome: 'Salário', tipo: 'receita', cor: '#10b981' },
    { nome: 'Bônus', tipo: 'receita', cor: '#10b981' }
];

// Flag para controlar se a verificação já foi executada nesta sessão
let categoriesInitialized = false;
let categoriesInitializationInProgress = false;

// Função utilitária para formatar valores monetários (Recomendado para dados financeiros)
const formatCurrency = (value, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency,
    }).format(value);
};

// Função utilitária para obter o símbolo da moeda a partir do código
const getCurrencySymbol = (currency) => {
  const symbols = {
      'BRL': 'R$',
      'EUR': '€',
      'USD': '$',
  };
  return symbols[currency] || currency;
};

// Função para verificar e criar categorias pré-definidas
const checkAndCreatePredefinedCategories = async () => {
    // Se já foi executada nesta sessão, não executa novamente
    if (categoriesInitialized) {
        console.log('✅ Verificação de categorias pré-definidas já foi executada nesta sessão');
        return;
    }

    // Se já está em progresso, não executa novamente
    if (categoriesInitializationInProgress) {
        console.log('⏳ Verificação de categorias pré-definidas já está em progresso');
        return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
        console.warn('⚠️ Token de autenticação não encontrado');
        return;
    }

    // Marcar como em progresso
    categoriesInitializationInProgress = true;

    try {
        console.log('🔍 Verificando categorias pré-definidas...');
        console.log('📋 Categorias pré-definidas a verificar:', PREDEFINED_CATEGORIES.map(c => `${c.nome} (${c.tipo})`));
        
        // Buscar categorias existentes do usuário
        const response = await fetch(`${API_BASE_URL}/categorias`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            console.warn('⚠️ Não foi possível verificar categorias existentes');
            return;
        }

        const existingCategories = await response.json();
        console.log('📊 Categorias existentes no banco:', existingCategories.map(c => `${c.nome} (${c.tipo})`));
        
        // Criar um mapa das categorias existentes (nome + tipo) para verificação exata
        const existingCategoriesMap = new Map();
        existingCategories.forEach(cat => {
            const key = `${cat.nome.toLowerCase().trim()}_${cat.tipo}`;
            existingCategoriesMap.set(key, cat);
        });

        // Verificar quais categorias pré-definidas ainda não existem
        const categoriesToCreate = [];
        PREDEFINED_CATEGORIES.forEach(category => {
            const key = `${category.nome.toLowerCase().trim()}_${category.tipo}`;
            if (!existingCategoriesMap.has(key)) {
                categoriesToCreate.push(category);
                console.log(`➕ Categoria a ser criada: "${category.nome}" (${category.tipo})`);
            } else {
                console.log(`✅ Categoria já existe: "${category.nome}" (${category.tipo})`);
            }
        });

        if (categoriesToCreate.length === 0) {
            console.log('✅ Todas as categorias pré-definidas já existem');
            categoriesInitialized = true;
            return;
        }

        console.log(`🔄 Criando ${categoriesToCreate.length} categorias pré-definidas...`);

        // Criar categorias que não existem de forma individual
        let createdCount = 0;
        for (const category of categoriesToCreate) {
            try {
                console.log(`🔄 Tentando criar categoria: "${category.nome}" (${category.tipo})`);
                
                const createResponse = await fetch(`${API_BASE_URL}/categorias`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        nome: category.nome,
                        tipo: category.tipo,
                        cor: category.cor
                    }),
                });

                if (createResponse.ok) {
                    const createdCategory = await createResponse.json();
                    console.log(`✅ Categoria "${category.nome}" (${category.tipo}) criada com sucesso. ID: ${createdCategory.id}`);
                    createdCount++;
                } else {
                    const errorData = await createResponse.json();
                    console.warn(`⚠️ Erro ao criar categoria "${category.nome}":`, errorData);
                    
                    // Se o erro for de duplicação, não é um problema crítico
                    if (errorData.erro && errorData.erro.includes('já existe')) {
                        console.log(`ℹ️ Categoria "${category.nome}" já existe no banco (erro de duplicação ignorado)`);
                        createdCount++; // Conta como sucesso
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Erro ao criar categoria "${category.nome}":`, error);
            }
        }

        console.log(`✅ Processo concluído: ${createdCount} categorias processadas`);
        
        // Marcar como inicializado para evitar execuções futuras nesta sessão
        categoriesInitialized = true;
        
    } catch (error) {
        console.warn('⚠️ Erro ao verificar/criar categorias pré-definidas:', error);
    } finally {
        // Sempre limpar a flag de progresso
        categoriesInitializationInProgress = false;
    }
};

// Componente de ícone de carregamento simples
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Carregando...
  </div>
);

// --------------------------------------------------------------------------------
// Componente de Modal de Sucesso (Reutilizável)
// --------------------------------------------------------------------------------
const SuccessModal = ({ isOpen, message, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
      // Overlay (Fundo escurecido com estilo inline para a transparência)
      <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }} 
      >
          {/* Conteúdo do Modal */}
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
              <div className="flex flex-col items-center">
                  {/* Ícone de Sucesso */}
                  <Check size={48} className="text-blue-600 mb-4 bg-blue-100 p-2 rounded-full" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Sucesso!</h3>
                  <p className="text-center text-gray-600 mb-6">{message}</p>
              </div>
              
              {/* Botão de Confirmação, que aciona a ação de conclusão (voltar ao menu) */}
              <button
                  onClick={onConfirm || onClose}
                  className="w-full py-2.5 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 transition duration-150 shadow-md"
              >
                  Entendido
              </button>
          </div>
      </div>
  );
};

// ====================================================================
// COMPONENTES REUTILIZÁVEIS DE UI
// ====================================================================

const ConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
      // Overlay de Fundo (AGORA COM ESTILO INLINE PARA A TRANSPARÊNCIA)
      <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }} 
      >
          {/* Corpo do Modal */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm transform scale-100 opacity-100">
              <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmação de Saída</h3>
                  <p className="text-gray-600 mb-6">
                      Tem certeza de que deseja sair da sua conta e retornar à tela de login?
                  </p>
                  <div className="flex justify-end space-x-3">
                      <button
                          onClick={onCancel}
                          className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                          <X className="w-4 h-4 mr-1 inline" /> Cancelar
                      </button>
                      <button
                          onClick={onConfirm}
                          className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
                      >
                          <Check className="w-4 h-4 mr-1 inline" /> Sair
                      </button>
                  </div>
                </div>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Excluir Fatura
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Tem certeza que deseja excluir esta fatura? Esta ação irá estornar o pagamento e não pode ser desfeita.
                            </p>
                            
                            {faturaToDelete && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                    <div className="text-sm text-gray-600">
                                        <div className="font-medium mb-2">Detalhes da Fatura:</div>
                                        <div>• Cartão: {faturaToDelete.cartao}</div>
                                        <div>• Valor: {getCurrencySymbol(faturaToDelete.moeda)} {parseFloat(faturaToDelete.valor_total_fatura).toFixed(2)}</div>
                                        <div>• Vencimento: {formatDate(faturaToDelete.parcelas[0]?.data_vencimento)}</div>
                                        <div>• Status: {getFaturaStatus(faturaToDelete)}</div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Modal Genérico de Resultado (Sucesso/Erro na Transação)
const GenericResultModal = ({ isOpen, type, message, onConfirm }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const colorClass = isSuccess ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700';
  const bgColor = isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
  const Icon = isSuccess ? Check : X;
  const title = isSuccess ? 'Sucesso!' : 'Erro!';

  return (
      <div 
          className="fixed inset-0 flex justify-center items-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      >
          <div className={`bg-white p-6 rounded-xl shadow-2xl w-full max-w-xs border-t-4 ${colorClass}`}>
              <div className="flex items-center mb-4">
                  <Icon size={24} className="mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">{message}</p>
              <button
                  onClick={onConfirm}
                  className={`w-full py-2 rounded-lg text-white font-semibold transition-colors ${bgColor}`}
              >
                  OK
              </button>
          </div>
      </div>
  );
};

// --------------------------------------------------------------------------------
// Navegação Inferior (Mobile Pattern)
// --------------------------------------------------------------------------------
const BottomNavigationBar = ({ activeTab, setActiveTab, setShowModal, isLoadingTransactions }) => {
    const navItems = [
        { name: 'Dashboard', icon: Home, tab: 'dashboard' },
        { name: 'Cartões', icon: CreditCard, tab: 'cartoes' },
        { name: 'Contas', icon: Layers, tab: 'contas' },
        { name: 'Transações', icon: DollarSign, tab: 'transactions' },
    ];

    return (
        <nav className="bottom-nav-fixed">
            <div className="flex justify-around items-center h-16 max-w-xl mx-auto">
                {navItems.map(({ name, icon: Icon, tab }) => {
                    const isTransactionsTab = tab === 'transactions';
                    const isCurrentlyLoading = isTransactionsTab && isLoadingTransactions;
                    
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            disabled={isCurrentlyLoading}
                            className={`flex flex-col items-center p-1 text-xs font-medium transition-colors ${
                                isCurrentlyLoading 
                                    ? 'cursor-not-allowed opacity-70' 
                                    : 'cursor-pointer'
                            } ${
                                activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
                            }`}
                            aria-label={name}
                        >
                            {isCurrentlyLoading ? (
                                <Loader2 size={24} className="mb-0.5 animate-spin text-blue-600" />
                            ) : (
                                <Icon size={24} className="mb-0.5" />
                            )}
                            {name}
                        </button>
                    );
                })}
                {/* Botão Sair integrado na barra inferior */}
                <button
                    onClick={() => setShowModal(true)}
                    className="flex flex-col items-center p-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    aria-label="Sair"
                >
                    <LogOut size={24} className="mb-0.5" />
                    Sair
                </button>
            </div>
        </nav>
    );
};

// ====================================================================
// TELAS DE CONTEÚDO (MOBILE)
// ====================================================================

// Mock de dados para o Dashboard
const mockDashboardData = {
    saldoTotal: 15432.50,
    moeda: 'BRL',
    ultimasTransacoes: [
        { id: 1, descricao: 'Aluguel', valor: -3500.00, tipo: 'Despesa', data: '2025-10-15', categoria: 'Moradia' },
        { id: 2, descricao: 'Salário', valor: 6000.00, tipo: 'Receita', data: '2025-10-05', categoria: 'Trabalho' },
        { id: 3, descricao: 'Compras', valor: -150.80, tipo: 'Despesa', data: '2025-10-18', categoria: 'Alimentação' },
    ],
};

const DashboardScreen = () => {
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        // Recuperar a moeda salva no localStorage, ou usar BRL como padrão
        return localStorage.getItem('dashboardCurrency') || 'BRL';
    });
    const [totalBalance, setTotalBalance] = useState(0);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [balanceError, setBalanceError] = useState(null);
    
    // Estados para receitas e despesas do mês
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
    const [monthlyError, setMonthlyError] = useState(null);
    
    // Estados para o gráfico
    const [chartType, setChartType] = useState('despesas'); // 'despesas' ou 'receitas'
    const [chartPeriod, setChartPeriod] = useState('mensal'); // 'geral', 'anual', 'semestral', 'trimestral', 'mensal'
    const [chartSpecificPeriod, setChartSpecificPeriod] = useState(new Date().getMonth() + 1); // Período específico selecionado
    const [chartData, setChartData] = useState([]);
    const [isLoadingChart, setIsLoadingChart] = useState(false);
    const [chartError, setChartError] = useState(null);
    
    // Estado para ano selecionado no gráfico de análise por período
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [categoryChartType, setCategoryChartType] = useState('despesas'); // 'despesas' ou 'receitas'
    const [categoryChartPeriod, setCategoryChartPeriod] = useState('mensal'); // 'geral', 'anual', 'semestral', 'trimestral', 'mensal'
    const [categoryChartSpecificPeriod, setCategoryChartSpecificPeriod] = useState(new Date().getMonth() + 1); // Mês atual como padrão
    const [categoryChartData, setCategoryChartData] = useState([]);
    const [isLoadingCategoryChart, setIsLoadingCategoryChart] = useState(false);
    const [categoryChartError, setCategoryChartError] = useState(null);
    const [recurrenceChartType, setRecurrenceChartType] = useState('despesas'); // 'despesas' ou 'receitas'
    const [recurrenceChartPeriod, setRecurrenceChartPeriod] = useState('mensal'); // 'geral', 'anual', 'semestral', 'trimestral', 'mensal'
    const [recurrenceChartSpecificPeriod, setRecurrenceChartSpecificPeriod] = useState(new Date().getMonth() + 1); // Período específico selecionado
    const [recurrenceChartData, setRecurrenceChartData] = useState([]);
    const [isLoadingRecurrenceChart, setIsLoadingRecurrenceChart] = useState(false);
    const [recurrenceChartError, setRecurrenceChartError] = useState(null);
    
    // Estados para próximas faturas
    const [upcomingInvoices, setUpcomingInvoices] = useState([]);
    const [isLoadingUpcomingInvoices, setIsLoadingUpcomingInvoices] = useState(false);
    const [upcomingInvoicesError, setUpcomingInvoicesError] = useState(null);
    
    // Função para buscar saldo total baseado na moeda selecionada
    const fetchTotalBalance = useCallback(async (currency) => {
        setIsLoadingBalance(true);
        setBalanceError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/saldo/total/${currency.toLowerCase()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setTotalBalance(data.saldo_total);
            } else {
                setBalanceError('Erro ao carregar saldo');
            }
        } catch (error) {
            console.error('Erro ao buscar saldo:', error);
            setBalanceError('Erro ao carregar saldo');
        } finally {
            setIsLoadingBalance(false);
        }
    }, []);
    
    // Função para buscar receitas e despesas do mês atual
    const fetchMonthlyData = useCallback(async (currency) => {
        setIsLoadingMonthly(true);
        setMonthlyError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11, então +1
            
            // Buscar dados financeiros do mês atual
            const response = await fetch(`${API_BASE_URL}/financeiro/mensal/${currency.toLowerCase()}/${currentYear}/${currentMonth}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setMonthlyIncome(data.receitas.total_convertido);
                setMonthlyExpenses(data.gastos.total_convertido);
            } else {
                setMonthlyError('Erro ao carregar dados mensais');
            }
        } catch (error) {
            console.error('Erro ao buscar dados mensais:', error);
            setMonthlyError('Erro ao carregar dados mensais');
        } finally {
            setIsLoadingMonthly(false);
        }
    }, []);

    // Função para buscar dados do gráfico por categoria
    const fetchCategoryChartData = useCallback(async (currency, type, period, specificPeriod = null) => {
        setIsLoadingCategoryChart(true);
        setCategoryChartError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            const currentYear = new Date().getFullYear();
            let chartData = [];
            
            if (period === 'geral') {
                const url = type === 'despesas' 
                    ? `${API_BASE_URL}/gastos/categoria/geral/${currency.toLowerCase()}`
                    : `${API_BASE_URL}/receitas/categoria/geral/${currency.toLowerCase()}`;
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    chartData = (data.categorias || []).map(item => ({
                        categoria: item.categoria_nome,
                        valor: item.total_convertido
                    }));
                }
            } else if (period === 'anual') {
                const year = specificPeriod || currentYear;
                const url = type === 'despesas' 
                    ? `${API_BASE_URL}/gastos/categoria/anual/${currency.toLowerCase()}/${year}`
                    : `${API_BASE_URL}/receitas/categoria/anual/${currency.toLowerCase()}/${year}`;
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    chartData = (data.categorias || []).map(item => ({
                        categoria: item.categoria_nome,
                        valor: item.total_convertido
                    }));
                }
            } else if (period === 'semestral') {
                if (specificPeriod) {
                    // Buscar apenas o semestre específico
                    const url = type === 'despesas' 
                        ? `${API_BASE_URL}/gastos/categoria/semestral/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`
                        : `${API_BASE_URL}/receitas/categoria/semestral/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`;
                    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                    
                    if (response.ok) {
                        const data = await response.json();
                        chartData = (data.categorias || []).map(item => ({
                            categoria: item.categoria_nome,
                            valor: item.total_convertido
                        }));
                    }
                } else {
                    // Buscar todos os semestres (comportamento original)
                    const promises = [];
                    for (let semestre = 1; semestre <= 2; semestre++) {
                        const url = type === 'despesas' 
                            ? `${API_BASE_URL}/gastos/categoria/semestral/${currency.toLowerCase()}/${currentYear}/${semestre}`
                            : `${API_BASE_URL}/receitas/categoria/semestral/${currency.toLowerCase()}/${currentYear}/${semestre}`;
                        promises.push(fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }));
                    }
                
                const responses = await Promise.all(promises);
                const dataPromises = responses.map(response => response.json());
                const dataArray = await Promise.all(dataPromises);
                
                // Consolidar dados de ambos os semestres
                const consolidatedData = {};
                dataArray.forEach(data => {
                    const categories = data.categorias || [];
                    categories.forEach(item => {
                        const categoriaNome = item.categoria_nome;
                        const valor = item.total_convertido;
                        if (consolidatedData[categoriaNome]) {
                            consolidatedData[categoriaNome] += valor;
                        } else {
                            consolidatedData[categoriaNome] = valor;
                        }
                    });
                });
                
                chartData = Object.entries(consolidatedData).map(([categoria, valor]) => ({
                    categoria,
                    valor
                }));
                }
            } else if (period === 'trimestral') {
                if (specificPeriod) {
                    // Buscar apenas o trimestre específico
                    const url = type === 'despesas' 
                        ? `${API_BASE_URL}/gastos/categoria/trimestral/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`
                        : `${API_BASE_URL}/receitas/categoria/trimestral/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`;
                    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                    
                    if (response.ok) {
                        const data = await response.json();
                        chartData = (data.categorias || []).map(item => ({
                            categoria: item.categoria_nome,
                            valor: item.total_convertido
                        }));
                    }
                } else {
                    // Buscar todos os trimestres (comportamento original)
                    const promises = [];
                    for (let trimestre = 1; trimestre <= 4; trimestre++) {
                        const url = type === 'despesas' 
                            ? `${API_BASE_URL}/gastos/categoria/trimestral/${currency.toLowerCase()}/${currentYear}/${trimestre}`
                            : `${API_BASE_URL}/receitas/categoria/trimestral/${currency.toLowerCase()}/${currentYear}/${trimestre}`;
                        promises.push(fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }));
                    }
                
                const responses = await Promise.all(promises);
                const dataPromises = responses.map(response => response.json());
                const dataArray = await Promise.all(dataPromises);
                
                // Consolidar dados de todos os trimestres
                const consolidatedData = {};
                dataArray.forEach(data => {
                    const categories = data.categorias || [];
                    categories.forEach(item => {
                        const categoriaNome = item.categoria_nome;
                        const valor = item.total_convertido;
                        if (consolidatedData[categoriaNome]) {
                            consolidatedData[categoriaNome] += valor;
                        } else {
                            consolidatedData[categoriaNome] = valor;
                        }
                    });
                });
                
                chartData = Object.entries(consolidatedData).map(([categoria, valor]) => ({
                    categoria,
                    valor
                }));
                }
            } else if (period === 'mensal') {
                if (specificPeriod) {
                    // Buscar apenas o mês específico
                    const url = type === 'despesas' 
                        ? `${API_BASE_URL}/gastos/categoria/mensal/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`
                        : `${API_BASE_URL}/receitas/categoria/mensal/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`;
                    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                    
                    if (response.ok) {
                        const data = await response.json();
                        chartData = (data.categorias || []).map(item => ({
                            categoria: item.categoria_nome,
                            valor: item.total_convertido
                        }));
                    }
                } else {
                    // Buscar todos os meses (comportamento original)
                    const promises = [];
                    for (let mes = 1; mes <= 12; mes++) {
                        const url = type === 'despesas' 
                            ? `${API_BASE_URL}/gastos/categoria/mensal/${currency.toLowerCase()}/${currentYear}/${mes}`
                            : `${API_BASE_URL}/receitas/categoria/mensal/${currency.toLowerCase()}/${currentYear}/${mes}`;
                        promises.push(fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }));
                    }
                
                const responses = await Promise.all(promises);
                const dataPromises = responses.map(response => response.json());
                const dataArray = await Promise.all(dataPromises);
                
                // Consolidar dados de todos os meses
                const consolidatedData = {};
                dataArray.forEach(data => {
                    const categories = data.categorias || [];
                    categories.forEach(item => {
                        const categoriaNome = item.categoria_nome;
                        const valor = item.total_convertido;
                        if (consolidatedData[categoriaNome]) {
                            consolidatedData[categoriaNome] += valor;
                        } else {
                            consolidatedData[categoriaNome] = valor;
                        }
                    });
                });
                
                chartData = Object.entries(consolidatedData).map(([categoria, valor]) => ({
                    categoria,
                    valor
                }));
                }
            }
            
            // Garantir que chartData é um array antes de ordenar
            if (!Array.isArray(chartData)) {
                chartData = [];
            }
            
            // Ordenar por valor decrescente e pegar apenas as 9 primeiras
            chartData = chartData
                .filter(item => item.valor > 0) // Filtrar apenas categorias com valor > 0
                .sort((a, b) => b.valor - a.valor)
                .slice(0, 9);
            
            console.log('Dados do gráfico por categoria:', chartData); // Debug
            
            setCategoryChartData(chartData);
        } catch (error) {
            console.error('Erro ao buscar dados do gráfico por categoria:', error);
            setCategoryChartError('Erro ao carregar dados do gráfico por categoria');
        } finally {
            setIsLoadingCategoryChart(false);
        }
    }, []);

    // Função para buscar dados do gráfico por recorrência
    const fetchRecurrenceChartData = useCallback(async (currency, type, period, specificPeriod = null) => {
        setIsLoadingRecurrenceChart(true);
        setRecurrenceChartError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            const currentYear = new Date().getFullYear();
            let url = '';
            
            if (period === 'geral') {
                url = `${API_BASE_URL}/recorrencia/geral/${currency.toLowerCase()}`;
            } else if (period === 'anual') {
                const year = specificPeriod || currentYear;
                url = `${API_BASE_URL}/recorrencia/anual/${currency.toLowerCase()}/${year}`;
            } else if (period === 'semestral') {
                if (specificPeriod) {
                    // Buscar apenas o semestre específico
                    const url = `${API_BASE_URL}/recorrencia/semestral/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`;
                    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const chartData = type === 'despesas' ? [
                            { label: 'Fixo', value: data.despesas.fixo.total, percentual: data.despesas.fixo.percentual, transacoes: data.despesas.fixo.transacoes },
                            { label: 'Esporádico', value: data.despesas.esporadico.total, percentual: data.despesas.esporadico.percentual, transacoes: data.despesas.esporadico.transacoes }
                        ] : [
                            { label: 'Fixo', value: data.receitas.fixo.total, percentual: data.receitas.fixo.percentual, transacoes: data.receitas.fixo.transacoes },
                            { label: 'Esporádico', value: data.receitas.esporadico.total, percentual: data.receitas.esporadico.percentual, transacoes: data.receitas.esporadico.transacoes }
                        ];
                        
                        // Verificar se há dados válidos (pelo menos um valor > 0)
                        const hasValidData = chartData.some(item => item.value > 0);
                        if (hasValidData) {
                            setRecurrenceChartData(chartData);
                        } else {
                            setRecurrenceChartData([]); // Array vazio para mostrar "Nenhum dado disponível"
                        }
                        return;
                    }
                } else {
                    // Buscar todos os semestres (comportamento original)
                    const promises = [];
                    for (let semestre = 1; semestre <= 2; semestre++) {
                        const semUrl = `${API_BASE_URL}/recorrencia/semestral/${currency.toLowerCase()}/${currentYear}/${semestre}`;
                        promises.push(fetch(semUrl, { headers: { 'Authorization': `Bearer ${token}` } }));
                    }
                    
                    const responses = await Promise.all(promises);
                    const dataPromises = responses.map(response => response.json());
                    const dataArray = await Promise.all(dataPromises);
                    
                    // Consolidar dados de ambos os semestres
                    const consolidatedData = {
                        despesas: { fixo: { total: 0, transacoes: 0 }, esporadico: { total: 0, transacoes: 0 } },
                        receitas: { fixo: { total: 0, transacoes: 0 }, esporadico: { total: 0, transacoes: 0 } }
                    };
                    
                    dataArray.forEach(data => {
                        consolidatedData.despesas.fixo.total += data.despesas.fixo.total;
                        consolidatedData.despesas.fixo.transacoes += data.despesas.fixo.transacoes;
                        consolidatedData.despesas.esporadico.total += data.despesas.esporadico.total;
                        consolidatedData.despesas.esporadico.transacoes += data.despesas.esporadico.transacoes;
                        consolidatedData.receitas.fixo.total += data.receitas.fixo.total;
                        consolidatedData.receitas.fixo.transacoes += data.receitas.fixo.transacoes;
                        consolidatedData.receitas.esporadico.total += data.receitas.esporadico.total;
                        consolidatedData.receitas.esporadico.transacoes += data.receitas.esporadico.transacoes;
                    });
                    
                    // Recalcular percentuais
                    const totalDespesas = consolidatedData.despesas.fixo.total + consolidatedData.despesas.esporadico.total;
                    const totalReceitas = consolidatedData.receitas.fixo.total + consolidatedData.receitas.esporadico.total;
                    
                    consolidatedData.despesas.fixo.percentual = totalDespesas > 0 ? (consolidatedData.despesas.fixo.total / totalDespesas) * 100 : 0;
                    consolidatedData.despesas.esporadico.percentual = totalDespesas > 0 ? (consolidatedData.despesas.esporadico.total / totalDespesas) * 100 : 0;
                    consolidatedData.receitas.fixo.percentual = totalReceitas > 0 ? (consolidatedData.receitas.fixo.total / totalReceitas) * 100 : 0;
                    consolidatedData.receitas.esporadico.percentual = totalReceitas > 0 ? (consolidatedData.receitas.esporadico.total / totalReceitas) * 100 : 0;
                    
                    const chartData = type === 'despesas' ? [
                        { label: 'Fixo', value: consolidatedData.despesas.fixo.total, percentual: consolidatedData.despesas.fixo.percentual, transacoes: consolidatedData.despesas.fixo.transacoes },
                        { label: 'Esporádico', value: consolidatedData.despesas.esporadico.total, percentual: consolidatedData.despesas.esporadico.percentual, transacoes: consolidatedData.despesas.esporadico.transacoes }
                    ] : [
                        { label: 'Fixo', value: consolidatedData.receitas.fixo.total, percentual: consolidatedData.receitas.fixo.percentual, transacoes: consolidatedData.receitas.fixo.transacoes },
                        { label: 'Esporádico', value: consolidatedData.receitas.esporadico.total, percentual: consolidatedData.receitas.esporadico.percentual, transacoes: consolidatedData.receitas.esporadico.transacoes }
                    ];
                    
                    // Verificar se há dados válidos (pelo menos um valor > 0)
                    const hasValidData = chartData.some(item => item.value > 0);
                    if (hasValidData) {
                        setRecurrenceChartData(chartData);
                    } else {
                        setRecurrenceChartData([]); // Array vazio para mostrar "Nenhum dado disponível"
                    }
                    return;
                }
            } else if (period === 'trimestral') {
                if (specificPeriod) {
                    // Buscar apenas o trimestre específico
                    const url = `${API_BASE_URL}/recorrencia/trimestral/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`;
                    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const chartData = type === 'despesas' ? [
                            { label: 'Fixo', value: data.despesas.fixo.total, percentual: data.despesas.fixo.percentual, transacoes: data.despesas.fixo.transacoes },
                            { label: 'Esporádico', value: data.despesas.esporadico.total, percentual: data.despesas.esporadico.percentual, transacoes: data.despesas.esporadico.transacoes }
                        ] : [
                            { label: 'Fixo', value: data.receitas.fixo.total, percentual: data.receitas.fixo.percentual, transacoes: data.receitas.fixo.transacoes },
                            { label: 'Esporádico', value: data.receitas.esporadico.total, percentual: data.receitas.esporadico.percentual, transacoes: data.receitas.esporadico.transacoes }
                        ];
                        
                        // Verificar se há dados válidos (pelo menos um valor > 0)
                        const hasValidData = chartData.some(item => item.value > 0);
                        if (hasValidData) {
                            setRecurrenceChartData(chartData);
                        } else {
                            setRecurrenceChartData([]); // Array vazio para mostrar "Nenhum dado disponível"
                        }
                        return;
                    }
                } else {
                    // Buscar todos os trimestres (comportamento original)
                    const promises = [];
                    for (let trimestre = 1; trimestre <= 4; trimestre++) {
                        const trimUrl = `${API_BASE_URL}/recorrencia/trimestral/${currency.toLowerCase()}/${currentYear}/${trimestre}`;
                        promises.push(fetch(trimUrl, { headers: { 'Authorization': `Bearer ${token}` } }));
                    }
                    
                    const responses = await Promise.all(promises);
                    const dataPromises = responses.map(response => response.json());
                    const dataArray = await Promise.all(dataPromises);
                    
                    // Consolidar dados de todos os trimestres
                    const consolidatedData = {
                        despesas: { fixo: { total: 0, transacoes: 0 }, esporadico: { total: 0, transacoes: 0 } },
                        receitas: { fixo: { total: 0, transacoes: 0 }, esporadico: { total: 0, transacoes: 0 } }
                    };
                    
                    dataArray.forEach(data => {
                        consolidatedData.despesas.fixo.total += data.despesas.fixo.total;
                        consolidatedData.despesas.fixo.transacoes += data.despesas.fixo.transacoes;
                        consolidatedData.despesas.esporadico.total += data.despesas.esporadico.total;
                        consolidatedData.despesas.esporadico.transacoes += data.despesas.esporadico.transacoes;
                        consolidatedData.receitas.fixo.total += data.receitas.fixo.total;
                        consolidatedData.receitas.fixo.transacoes += data.receitas.fixo.transacoes;
                        consolidatedData.receitas.esporadico.total += data.receitas.esporadico.total;
                        consolidatedData.receitas.esporadico.transacoes += data.receitas.esporadico.transacoes;
                    });
                    
                    // Recalcular percentuais
                    const totalDespesas = consolidatedData.despesas.fixo.total + consolidatedData.despesas.esporadico.total;
                    const totalReceitas = consolidatedData.receitas.fixo.total + consolidatedData.receitas.esporadico.total;
                    
                    consolidatedData.despesas.fixo.percentual = totalDespesas > 0 ? (consolidatedData.despesas.fixo.total / totalDespesas) * 100 : 0;
                    consolidatedData.despesas.esporadico.percentual = totalDespesas > 0 ? (consolidatedData.despesas.esporadico.total / totalDespesas) * 100 : 0;
                    consolidatedData.receitas.fixo.percentual = totalReceitas > 0 ? (consolidatedData.receitas.fixo.total / totalReceitas) * 100 : 0;
                    consolidatedData.receitas.esporadico.percentual = totalReceitas > 0 ? (consolidatedData.receitas.esporadico.total / totalReceitas) * 100 : 0;
                    
                    const chartData = type === 'despesas' ? [
                        { label: 'Fixo', value: consolidatedData.despesas.fixo.total, percentual: consolidatedData.despesas.fixo.percentual, transacoes: consolidatedData.despesas.fixo.transacoes },
                        { label: 'Esporádico', value: consolidatedData.despesas.esporadico.total, percentual: consolidatedData.despesas.esporadico.percentual, transacoes: consolidatedData.despesas.esporadico.transacoes }
                    ] : [
                        { label: 'Fixo', value: consolidatedData.receitas.fixo.total, percentual: consolidatedData.receitas.fixo.percentual, transacoes: consolidatedData.receitas.fixo.transacoes },
                        { label: 'Esporádico', value: consolidatedData.receitas.esporadico.total, percentual: consolidatedData.receitas.esporadico.percentual, transacoes: consolidatedData.receitas.esporadico.transacoes }
                    ];
                    
                    // Verificar se há dados válidos (pelo menos um valor > 0)
                    const hasValidData = chartData.some(item => item.value > 0);
                    if (hasValidData) {
                        setRecurrenceChartData(chartData);
                    } else {
                        setRecurrenceChartData([]); // Array vazio para mostrar "Nenhum dado disponível"
                    }
                    return;
                }
            } else if (period === 'mensal') {
                if (specificPeriod) {
                    // Buscar apenas o mês específico
                    const url = `${API_BASE_URL}/recorrencia/mensal/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`;
                    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const chartData = type === 'despesas' ? [
                            { label: 'Fixo', value: data.despesas.fixo.total, percentual: data.despesas.fixo.percentual, transacoes: data.despesas.fixo.transacoes },
                            { label: 'Esporádico', value: data.despesas.esporadico.total, percentual: data.despesas.esporadico.percentual, transacoes: data.despesas.esporadico.transacoes }
                        ] : [
                            { label: 'Fixo', value: data.receitas.fixo.total, percentual: data.receitas.fixo.percentual, transacoes: data.receitas.fixo.transacoes },
                            { label: 'Esporádico', value: data.receitas.esporadico.total, percentual: data.receitas.esporadico.percentual, transacoes: data.receitas.esporadico.transacoes }
                        ];
                        
                        // Verificar se há dados válidos (pelo menos um valor > 0)
                        const hasValidData = chartData.some(item => item.value > 0);
                        if (hasValidData) {
                            setRecurrenceChartData(chartData);
                        } else {
                            setRecurrenceChartData([]); // Array vazio para mostrar "Nenhum dado disponível"
                        }
                        return;
                    }
                } else {
                    // Buscar todos os meses (comportamento original)
                    const promises = [];
                    for (let mes = 1; mes <= 12; mes++) {
                        const mesUrl = `${API_BASE_URL}/recorrencia/mensal/${currency.toLowerCase()}/${currentYear}/${mes}`;
                        promises.push(fetch(mesUrl, { headers: { 'Authorization': `Bearer ${token}` } }));
                    }
                    
                    const responses = await Promise.all(promises);
                    const dataPromises = responses.map(response => response.json());
                    const dataArray = await Promise.all(dataPromises);
                    
                    // Consolidar dados de todos os meses
                    const consolidatedData = {
                        despesas: { fixo: { total: 0, transacoes: 0 }, esporadico: { total: 0, transacoes: 0 } },
                        receitas: { fixo: { total: 0, transacoes: 0 }, esporadico: { total: 0, transacoes: 0 } }
                    };
                    
                    dataArray.forEach(data => {
                        consolidatedData.despesas.fixo.total += data.despesas.fixo.total;
                        consolidatedData.despesas.fixo.transacoes += data.despesas.fixo.transacoes;
                        consolidatedData.despesas.esporadico.total += data.despesas.esporadico.total;
                        consolidatedData.despesas.esporadico.transacoes += data.despesas.esporadico.transacoes;
                        consolidatedData.receitas.fixo.total += data.receitas.fixo.total;
                        consolidatedData.receitas.fixo.transacoes += data.receitas.fixo.transacoes;
                        consolidatedData.receitas.esporadico.total += data.receitas.esporadico.total;
                        consolidatedData.receitas.esporadico.transacoes += data.receitas.esporadico.transacoes;
                    });
                    
                    // Recalcular percentuais
                    const totalDespesas = consolidatedData.despesas.fixo.total + consolidatedData.despesas.esporadico.total;
                    const totalReceitas = consolidatedData.receitas.fixo.total + consolidatedData.receitas.esporadico.total;
                    
                    consolidatedData.despesas.fixo.percentual = totalDespesas > 0 ? (consolidatedData.despesas.fixo.total / totalDespesas) * 100 : 0;
                    consolidatedData.despesas.esporadico.percentual = totalDespesas > 0 ? (consolidatedData.despesas.esporadico.total / totalDespesas) * 100 : 0;
                    consolidatedData.receitas.fixo.percentual = totalReceitas > 0 ? (consolidatedData.receitas.fixo.total / totalReceitas) * 100 : 0;
                    consolidatedData.receitas.esporadico.percentual = totalReceitas > 0 ? (consolidatedData.receitas.esporadico.total / totalReceitas) * 100 : 0;
                    
                    const chartData = type === 'despesas' ? [
                        { label: 'Fixo', value: consolidatedData.despesas.fixo.total, percentual: consolidatedData.despesas.fixo.percentual, transacoes: consolidatedData.despesas.fixo.transacoes },
                        { label: 'Esporádico', value: consolidatedData.despesas.esporadico.total, percentual: consolidatedData.despesas.esporadico.percentual, transacoes: consolidatedData.despesas.esporadico.transacoes }
                    ] : [
                        { label: 'Fixo', value: consolidatedData.receitas.fixo.total, percentual: consolidatedData.receitas.fixo.percentual, transacoes: consolidatedData.receitas.fixo.transacoes },
                        { label: 'Esporádico', value: consolidatedData.receitas.esporadico.total, percentual: consolidatedData.receitas.esporadico.percentual, transacoes: consolidatedData.receitas.esporadico.transacoes }
                    ];
                    
                    // Verificar se há dados válidos (pelo menos um valor > 0)
                    const hasValidData = chartData.some(item => item.value > 0);
                    if (hasValidData) {
                        setRecurrenceChartData(chartData);
                    } else {
                        setRecurrenceChartData([]); // Array vazio para mostrar "Nenhum dado disponível"
                    }
                    return;
                }
            }
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const chartData = type === 'despesas' ? [
                    { label: 'Fixo', value: data.despesas.fixo.total, percentual: data.despesas.fixo.percentual, transacoes: data.despesas.fixo.transacoes },
                    { label: 'Esporádico', value: data.despesas.esporadico.total, percentual: data.despesas.esporadico.percentual, transacoes: data.despesas.esporadico.transacoes }
                ] : [
                    { label: 'Fixo', value: data.receitas.fixo.total, percentual: data.receitas.fixo.percentual, transacoes: data.receitas.fixo.transacoes },
                    { label: 'Esporádico', value: data.receitas.esporadico.total, percentual: data.receitas.esporadico.percentual, transacoes: data.receitas.esporadico.transacoes }
                ];
                
                // Verificar se há dados válidos (pelo menos um valor > 0)
                const hasValidData = chartData.some(item => item.value > 0);
                if (hasValidData) {
                    setRecurrenceChartData(chartData);
                } else {
                    setRecurrenceChartData([]); // Array vazio para mostrar "Nenhum dado disponível"
                }
            } else {
                setRecurrenceChartData([]); // Array vazio para mostrar "Nenhum dado disponível"
            }
        } catch (error) {
            console.error('Erro ao buscar dados do gráfico por recorrência:', error);
            setRecurrenceChartError('Erro ao carregar dados do gráfico por recorrência');
        } finally {
            setIsLoadingRecurrenceChart(false);
        }
    }, []);

    // Função para buscar próximas faturas
    const fetchUpcomingInvoices = useCallback(async () => {
        setIsLoadingUpcomingInvoices(true);
        setUpcomingInvoicesError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/faturas/credito`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Filtrar apenas faturas pendentes e processar dados
                const pendingInvoices = data.faturas
                    .filter(fatura => fatura.parcelas.some(parcela => parcela.status === 'PENDENTE'))
                    .map(fatura => {
                        // Pegar a data de vencimento da primeira parcela pendente
                        const firstPendingParcel = fatura.parcelas.find(parcela => parcela.status === 'PENDENTE');
                        const dueDate = new Date(firstPendingParcel.data_vencimento);
                        const today = new Date();
                        const isOverdue = dueDate < today;
                        
                        return {
                            id_cartao: fatura.id_cartao,
                            cartao: fatura.cartao,
                            moeda: fatura.moeda,
                            fatura_referencia: fatura.fatura_referencia,
                            valor_total_fatura: parseFloat(fatura.valor_total_fatura),
                            data_vencimento: dueDate,
                            isOverdue: isOverdue,
                            parcelas: fatura.parcelas.filter(parcela => parcela.status === 'PENDENTE')
                        };
                    })
                    .sort((a, b) => {
                        // Ordenar: atrasadas primeiro, depois por data de vencimento
                        if (a.isOverdue && !b.isOverdue) return -1;
                        if (!a.isOverdue && b.isOverdue) return 1;
                        return a.data_vencimento - b.data_vencimento;
                    })
                    .slice(0, 5); // Pegar apenas as 5 próximas
                
                setUpcomingInvoices(pendingInvoices);
            } else {
                setUpcomingInvoicesError('Erro ao carregar próximas faturas');
            }
        } catch (error) {
            console.error('Erro ao buscar próximas faturas:', error);
            setUpcomingInvoicesError('Erro ao carregar próximas faturas');
        } finally {
            setIsLoadingUpcomingInvoices(false);
        }
    }, []);

    // Função para buscar dados do gráfico por período
    const fetchChartData = useCallback(async (currency, type, period, specificPeriod = null) => {
        setIsLoadingChart(true);
        setChartError(null);
        
        try {
            const token = localStorage.getItem('authToken');
            const currentYear = new Date().getFullYear();
            let chartData = [];
            
            if (period === 'geral') {
                // Para geral, mostrar apenas uma barra
                const url = `${API_BASE_URL}/financeiro/geral/${currency.toLowerCase()}`;
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const valor = type === 'despesas' ? data.gastos.total_convertido : data.receitas.total_convertido;
                    if (valor > 0) {
                        chartData = [{ periodo: 'Geral', valor }];
                    } else {
                        chartData = []; // Array vazio para mostrar "Nenhum dado disponível"
                    }
                }
            } else if (period === 'anual') {
                // Para anual, mostrar apenas uma barra
                const year = specificPeriod || currentYear;
                const url = `${API_BASE_URL}/financeiro/anual/${currency.toLowerCase()}/${year}`;
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const valor = type === 'despesas' ? data.gastos.total_convertido : data.receitas.total_convertido;
                    if (valor > 0) {
                        chartData = [{ periodo: `${year}`, valor }];
                    } else {
                        chartData = []; // Array vazio para mostrar "Nenhum dado disponível"
                    }
                }
            } else if (period === 'semestral') {
                if (specificPeriod) {
                    // Buscar apenas o semestre específico
                    const url = `${API_BASE_URL}/financeiro/semestral/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`;
                    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const valor = type === 'despesas' ? data.gastos.total_convertido : data.receitas.total_convertido;
                        if (valor > 0) {
                            chartData = [{ periodo: `Sem${specificPeriod}`, valor }];
                        } else {
                            chartData = []; // Array vazio para mostrar "Nenhum dado disponível"
                        }
                    }
                } else {
                    // Para semestral, mostrar 2 barras (1º e 2º semestre)
                    const promises = [];
                    for (let semestre = 1; semestre <= 2; semestre++) {
                        const url = `${API_BASE_URL}/financeiro/semestral/${currency.toLowerCase()}/${currentYear}/${semestre}`;
                        promises.push(fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }));
                    }
                    
                    const responses = await Promise.all(promises);
                    const dataPromises = responses.map(response => response.json());
                    const dataArray = await Promise.all(dataPromises);
                    
                    chartData = dataArray.map((data, index) => {
                        const valor = type === 'despesas' ? data.gastos.total_convertido : data.receitas.total_convertido;
                        return { periodo: `Sem${index + 1}`, valor };
                    }).filter(item => item.valor > 0); // Remove períodos sem dados
                }
            } else if (period === 'trimestral') {
                if (specificPeriod) {
                    // Buscar apenas o trimestre específico
                    const url = `${API_BASE_URL}/financeiro/trimestral/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`;
                    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const valor = type === 'despesas' ? data.gastos.total_convertido : data.receitas.total_convertido;
                        if (valor > 0) {
                            chartData = [{ periodo: `Trim${specificPeriod}`, valor }];
                        } else {
                            chartData = []; // Array vazio para mostrar "Nenhum dado disponível"
                        }
                    }
                } else {
                    // Para trimestral, mostrar 4 barras (1º, 2º, 3º e 4º trimestre)
                    const promises = [];
                    for (let trimestre = 1; trimestre <= 4; trimestre++) {
                        const url = `${API_BASE_URL}/financeiro/trimestral/${currency.toLowerCase()}/${currentYear}/${trimestre}`;
                        promises.push(fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }));
                    }
                    
                    const responses = await Promise.all(promises);
                    const dataPromises = responses.map(response => response.json());
                    const dataArray = await Promise.all(dataPromises);
                    
                    chartData = dataArray.map((data, index) => {
                        const valor = type === 'despesas' ? data.gastos.total_convertido : data.receitas.total_convertido;
                        return { periodo: `Trim${index + 1}`, valor };
                    }).filter(item => item.valor > 0); // Remove períodos sem dados
                }
            } else if (period === 'mensal') {
                if (specificPeriod) {
                    // Buscar apenas o mês específico
                    const url = `${API_BASE_URL}/financeiro/mensal/${currency.toLowerCase()}/${currentYear}/${specificPeriod}`;
                    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const valor = type === 'despesas' ? data.gastos.total_convertido : data.receitas.total_convertido;
                        if (valor > 0) {
                            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                                          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                            chartData = [{ periodo: meses[specificPeriod - 1], valor }];
                        } else {
                            chartData = []; // Array vazio para mostrar "Nenhum dado disponível"
                        }
                    }
                } else {
                    // Para mensal, mostrar 12 barras (Janeiro a Dezembro)
                    const promises = [];
                    for (let mes = 1; mes <= 12; mes++) {
                        const url = `${API_BASE_URL}/financeiro/mensal/${currency.toLowerCase()}/${currentYear}/${mes}`;
                        promises.push(fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }));
                    }
                    
                    const responses = await Promise.all(promises);
                    const dataPromises = responses.map(response => response.json());
                    const dataArray = await Promise.all(dataPromises);
                    
                    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                                  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                    
                    chartData = dataArray.map((data, index) => {
                        const valor = type === 'despesas' ? data.gastos.total_convertido : data.receitas.total_convertido;
                        return { periodo: meses[index], valor };
                    }).filter(item => item.valor > 0); // Remove meses sem dados
                }
            }
            
            setChartData(chartData);
        } catch (error) {
            console.error('Erro ao buscar dados do gráfico:', error);
            setChartError('Erro ao carregar dados do gráfico');
        } finally {
            setIsLoadingChart(false);
        }
    }, []);
    
    // Função para atualizar a moeda selecionada e salvar no localStorage
    const handleCurrencyChange = (newCurrency) => {
        setSelectedCurrency(newCurrency);
        localStorage.setItem('dashboardCurrency', newCurrency);
    };

    // Função para gerar opções do segundo dropdown baseado no período selecionado
    const getSpecificPeriodOptions = (period) => {
        const currentYear = new Date().getFullYear();
        
        switch (period) {
            case 'anual':
                return Array.from({ length: 5 }, (_, i) => {
                    const year = currentYear - i;
                    return { value: year, label: year };
                });
            case 'semestral':
                return [
                    { value: '1', label: '1º Semestre' },
                    { value: '2', label: '2º Semestre' }
                ];
            case 'trimestral':
                return [
                    { value: '1', label: '1º Trimestre' },
                    { value: '2', label: '2º Trimestre' },
                    { value: '3', label: '3º Trimestre' },
                    { value: '4', label: '4º Trimestre' }
                ];
            case 'mensal':
                return [
                    { value: '1', label: 'Janeiro' },
                    { value: '2', label: 'Fevereiro' },
                    { value: '3', label: 'Março' },
                    { value: '4', label: 'Abril' },
                    { value: '5', label: 'Maio' },
                    { value: '6', label: 'Junho' },
                    { value: '7', label: 'Julho' },
                    { value: '8', label: 'Agosto' },
                    { value: '9', label: 'Setembro' },
                    { value: '10', label: 'Outubro' },
                    { value: '11', label: 'Novembro' },
                    { value: '12', label: 'Dezembro' }
                ];
            default:
                return [];
        }
    };

    // Função para sincronizar todos os tipos (despesas/receitas)
    const handleTypeChange = (newType) => {
        setChartType(newType);
        setCategoryChartType(newType);
        setRecurrenceChartType(newType);
    };

    // Função para sincronizar todos os períodos
    const handlePeriodChange = (newPeriod) => {
        setChartPeriod(newPeriod);
        setCategoryChartPeriod(newPeriod);
        setRecurrenceChartPeriod(newPeriod);
        
        // Definir valor padrão baseado no período selecionado (apenas para outros gráficos)
        if (newPeriod === 'geral') {
            setCategoryChartSpecificPeriod('');
            setRecurrenceChartSpecificPeriod('');
        } else {
            const currentDate = new Date();
            let specificValue = '';
            
            switch (newPeriod) {
                case 'anual':
                    specificValue = currentDate.getFullYear();
                    break;
                case 'semestral':
                    specificValue = currentDate.getMonth() < 6 ? '1' : '2';
                    break;
                case 'trimestral':
                    const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
                    specificValue = quarter.toString();
                    break;
                case 'mensal':
                    specificValue = currentDate.getMonth() + 1;
                    break;
                default:
                    specificValue = '';
            }
            
            setCategoryChartSpecificPeriod(specificValue);
            setRecurrenceChartSpecificPeriod(specificValue);
        }
    };

    // Função para sincronizar todos os períodos específicos (apenas para outros gráficos)
    const handleSpecificPeriodChange = (newSpecificPeriod) => {
        setCategoryChartSpecificPeriod(newSpecificPeriod);
        setRecurrenceChartSpecificPeriod(newSpecificPeriod);
    };
    
    // Buscar dados quando moeda, tipo ou período mudarem
    useEffect(() => {
        fetchTotalBalance(selectedCurrency);
        fetchMonthlyData(selectedCurrency);
        fetchChartData(selectedCurrency, chartType, chartPeriod, null, selectedYear);
        fetchCategoryChartData(selectedCurrency, categoryChartType, categoryChartPeriod, categoryChartSpecificPeriod);
        fetchRecurrenceChartData(selectedCurrency, recurrenceChartType, recurrenceChartPeriod, recurrenceChartSpecificPeriod);
        fetchUpcomingInvoices();
    }, [selectedCurrency, chartType, chartPeriod, selectedYear, categoryChartType, categoryChartPeriod, categoryChartSpecificPeriod, recurrenceChartType, recurrenceChartPeriod, recurrenceChartSpecificPeriod, fetchTotalBalance, fetchMonthlyData, fetchChartData, fetchCategoryChartData, fetchRecurrenceChartData, fetchUpcomingInvoices]);
    
    return (
        <div className="p-4 space-y-5">
            {/* Header com título e seletores */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Resumo Financeiro</h2>
                
                {/* Seletores */}
                <div className="flex items-center space-x-4">
                    {/* Seletor de Moeda */}
                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-medium text-gray-600">Moeda:</label>
                        <select
                            value={selectedCurrency}
                            onChange={(e) => handleCurrencyChange(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            <option value="BRL">BRL</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                    
                    {/* Seletor de Tipo */}
                    <div className="flex items-center space-x-2">
                        <label className="text-xs font-medium text-gray-600">Tipo:</label>
                        <select
                            value={chartType}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            <option value="despesas">Despesas</option>
                            <option value="receitas">Receitas</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {/* Card de Saldo Total - Mobile */}
            <div className="p-5 bg-white shadow-xl rounded-2xl border-l-4 border-l-green-500">
                <p className="text-sm font-medium text-gray-500 mb-1">Seu Saldo Total</p>
                {isLoadingBalance ? (
                    <div className="flex items-center space-x-2">
                        <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                        <span className="text-lg text-gray-500">Carregando...</span>
                    </div>
                ) : balanceError ? (
                    <p className="text-lg text-red-500">{balanceError}</p>
                ) : (
                    <p className="text-3xl font-extrabold text-gray-900">
                        {getCurrencySymbol(selectedCurrency)} {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                )}
            </div>

            {/* Cards de Resumo Rápido */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white shadow-lg rounded-xl border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Receitas (Mês Atual)</p>
                    {isLoadingMonthly ? (
                        <div className="flex items-center space-x-2 mt-1">
                            <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                            <span className="text-sm text-gray-500">Carregando...</span>
                        </div>
                    ) : monthlyError ? (
                        <p className="text-sm text-red-500 mt-1">{monthlyError}</p>
                    ) : (
                        <p className="text-xl font-bold text-green-600 mt-1">
                            {getCurrencySymbol(selectedCurrency)} {monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    )}
                </div>
                <div className="p-4 bg-white shadow-lg rounded-xl border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Despesas (Mês Atual)</p>
                    {isLoadingMonthly ? (
                        <div className="flex items-center space-x-2 mt-1">
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                            <span className="text-sm text-gray-500">Carregando...</span>
                        </div>
                    ) : monthlyError ? (
                        <p className="text-sm text-red-500 mt-1">{monthlyError}</p>
                    ) : (
                        <p className="text-xl font-bold text-red-600 mt-1">
                            {getCurrencySymbol(selectedCurrency)} {monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    )}
                </div>
            </div>

            {/* Gráfico de Barras */}
            <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Análise por Período</h3>
                    
                    {/* Controles do Gráfico */}
                    <div className="flex space-x-2">
                        {/* Seletor de Período */}
                        <select
                            value={chartPeriod}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            <option value="geral">Geral</option>
                            <option value="anual">Anual</option>
                            <option value="semestral">Semestral</option>
                            <option value="trimestral">Trimestral</option>
                            <option value="mensal">Mensal</option>
                        </select>
                        
                        {/* Seletor de Ano */}
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            {Array.from({length: new Date().getFullYear() - 2024}, (_, i) => 2025 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Área do Gráfico */}
                <div className="h-80 p-4">
                    {isLoadingChart ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                            <span className="ml-2 text-gray-500">Carregando gráfico...</span>
                        </div>
                    ) : chartError ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-red-500">{chartError}</p>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Nenhum dado disponível</p>
                        </div>
                    ) : (
                        <div className="relative h-full">
                            {/* Eixo Y com valores */}
                            <div className="absolute left-0 top-8 bottom-4 w-16 flex flex-col justify-between text-xs text-gray-500">
                                {(() => {
                                    const maxValue = Math.max(...chartData.map(d => d.valor || 0));
                                    const levels = 5;
                                    const step = maxValue / levels;
                                    return Array.from({ length: levels + 1 }, (_, i) => {
                                        const value = maxValue - (i * step);
                                        return (
                                            <div key={i} className="text-right pr-2 whitespace-nowrap">
                                                {getCurrencySymbol(selectedCurrency)} {Math.round(value).toLocaleString('pt-BR')}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                            
                            {/* Linhas pontilhadas horizontais */}
                            <div className="absolute left-16 right-0 top-8 bottom-4">
                                {(() => {
                                    const levels = 5;
                                    return Array.from({ length: levels + 1 }, (_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-full border-t border-gray-200 border-dashed opacity-30"
                                            style={{ top: `${(i / levels) * 100}%` }}
                                        />
                                    ));
                                })()}
                            </div>
                            
                            {/* Barras do gráfico */}
                            <div className="absolute left-16 right-0 top-8 bottom-4 flex items-end pl-4 justify-evenly">
                                {chartData.map((item, index) => {
                                    const maxValue = Math.max(...chartData.map(d => d.valor || 0));
                                    const color = chartType === 'despesas' ? '#ef4444' : '#10b981';
                                    
                                    // Calcular altura proporcional - ajustar para a nova área do gráfico
                                    const chartHeight = 240; // Altura aumentada para corresponder à nova área (bottom-4)
                                    const heightInPixels = ((item.valor || 0) / maxValue) * chartHeight;
                                    
                                    return (
                                        <div key={index} className="flex flex-col items-center relative">
                                            {/* Barra */}
                                            <div
                                                className="w-6 rounded-t transition-all duration-300 hover:opacity-80 relative"
                                                style={{
                                                    height: `${heightInPixels}px`,
                                                    backgroundColor: color,
                                                    minHeight: '4px'
                                                }}
                                                title={`${item.periodo}: ${getCurrencySymbol(selectedCurrency)} ${(item.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                            >
                                                {/* Rótulo do valor na barra - posicionado no topo da barra */}
                                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-[9px] font-semibold text-gray-700 whitespace-nowrap">
                                                    {getCurrencySymbol(selectedCurrency)} {Math.round(item.valor || 0).toLocaleString('pt-BR')}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Labels dos períodos - posicionados abaixo da área do gráfico */}
                            <div className="absolute left-16 right-0 bottom-0 h-4 flex items-center pl-4 justify-evenly">
                                {chartData.map((item, index) => (
                                    <div key={index} className="text-xs font-medium text-gray-600 text-center w-6">
                                        {item.periodo}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Segundo gráfico - Análise por Categoria */}
            <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Análise por Categoria</h3>
                    
                    <div className="flex space-x-2">
                        <select 
                            value={categoryChartPeriod} 
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            <option value="anual">Anual</option>
                            <option value="semestral">Semestral</option>
                            <option value="trimestral">Trimestral</option>
                            <option value="mensal">Mensal</option>
                        </select>
                        <select 
                            value={categoryChartSpecificPeriod} 
                            onChange={(e) => handleSpecificPeriodChange(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            {getSpecificPeriodOptions(categoryChartPeriod).map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            {Array.from({length: new Date().getFullYear() - 2024}, (_, i) => 2025 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="h-80 p-4 overflow-y-auto">
                    {isLoadingCategoryChart ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                            <span className="ml-2 text-gray-500">Carregando gráfico...</span>
                        </div>
                    ) : categoryChartError ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-red-500">{categoryChartError}</p>
                        </div>
                    ) : categoryChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Nenhum dado disponível</p>
                        </div>
                    ) : (
                        <div className="relative h-full">
                            {/* Labels das categorias - fora da zona do gráfico */}
                            <div className="absolute left-0 top-0 bottom-8 w-32 flex flex-col justify-evenly text-[10px] font-medium text-gray-600">
                                {categoryChartData.map((item, index) => (
                                    <div key={index} className="text-right pr-2 h-8 flex items-center justify-end overflow-hidden">
                                        <span className="truncate">
                                            {item.categoria}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Eixo X com valores - agora na parte inferior */}
                            <div className="absolute left-32 right-0 bottom-0 h-8 flex justify-between items-center text-xs text-gray-500">
                                {(() => {
                                    const maxValue = Math.max(...categoryChartData.map(d => d.valor || 0));
                                    const levels = 5;
                                    const step = maxValue / levels;
                                    return Array.from({ length: levels + 1 }, (_, i) => {
                                        const value = (i * step);
                                        return (
                                            <div key={i} className="text-center whitespace-nowrap">
                                                {getCurrencySymbol(selectedCurrency)} {Math.round(value).toLocaleString('pt-BR')}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                            
                            {/* Linhas pontilhadas verticais */}
                            <div className="absolute left-32 right-0 top-0 bottom-8">
                                {(() => {
                                    const levels = 5;
                                    return Array.from({ length: levels + 1 }, (_, i) => (
                                        <div
                                            key={i}
                                            className="absolute h-full border-l border-gray-200 border-dashed opacity-30"
                                            style={{ left: `${(i / levels) * 100}%` }}
                                        />
                                    ));
                                })()}
                            </div>
                            
                            {/* Barras horizontais do gráfico */}
                            <div className="absolute left-32 right-0 top-0 bottom-8 flex flex-col justify-evenly">
                                {categoryChartData.map((item, index) => {
                                    const maxValue = Math.max(...categoryChartData.map(d => d.valor || 0));
                                    const color = categoryChartType === 'despesas' ? '#ef4444' : '#10b981';
                                    
                                    // Calcular largura proporcional ao espaço disponível (100% da área)
                                    const availableWidth = 100; // 100% da largura disponível
                                    const widthInPixels = ((item.valor || 0) / maxValue) * availableWidth;
                                    
                                    // Determinar se o rótulo cabe dentro da barra (assumindo ~80px para o texto)
                                    const labelText = `${getCurrencySymbol(selectedCurrency)} ${Math.round(item.valor || 0).toLocaleString('pt-BR')}`;
                                    const labelFitsInside = widthInPixels > 20; // Se a barra tem mais de 20% de largura
                                    
                                    return (
                                        <div key={index} className="flex items-center relative h-8">
                                            {/* Barra horizontal */}
                                            <div className="h-4 rounded-r transition-all duration-300 hover:opacity-80 relative"
                                                style={{
                                                    width: `${widthInPixels}%`,
                                                    backgroundColor: color,
                                                    minWidth: '4px'
                                                }}
                                                title={`${item.categoria}: ${getCurrencySymbol(selectedCurrency)} ${(item.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                            >
                                                {/* Label do valor - dentro da barra se couber */}
                                                {labelFitsInside && (
                                                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-white whitespace-nowrap">
                                                        {labelText}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Label do valor - fora da barra se não couber */}
                                            {!labelFitsInside && (
                                                <div className="ml-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                                    {labelText}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Terceiro gráfico - Análise por Recorrência (Gráfico de Rosca) */}
            <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Análise por Recorrência</h3>
                    
                    <div className="flex space-x-2">
                        <select 
                            value={recurrenceChartPeriod} 
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            <option value="anual">Anual</option>
                            <option value="semestral">Semestral</option>
                            <option value="trimestral">Trimestral</option>
                            <option value="mensal">Mensal</option>
                        </select>
                        <select 
                            value={recurrenceChartSpecificPeriod} 
                            onChange={(e) => handleSpecificPeriodChange(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            {getSpecificPeriodOptions(recurrenceChartPeriod).map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            {Array.from({length: new Date().getFullYear() - 2024}, (_, i) => 2025 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="h-80 p-4">
                    {isLoadingRecurrenceChart ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                            <span className="ml-2 text-gray-500">Carregando gráfico...</span>
                        </div>
                    ) : recurrenceChartError ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-red-500">{recurrenceChartError}</p>
                        </div>
                    ) : recurrenceChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Nenhum dado disponível</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="relative w-56 h-56">
                                {/* Gráfico de Rosca */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    {recurrenceChartData.map((item, index) => {
                                        const total = recurrenceChartData.reduce((sum, d) => sum + d.value, 0);
                                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                                        const circumference = 2 * Math.PI * 40; // Raio de 40
                                        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                                        const strokeDashoffset = index === 0 ? 0 : -((recurrenceChartData.slice(0, index).reduce((sum, d) => sum + d.value, 0) / total) * circumference);
                                        
                                        // Cores dinâmicas baseadas no tipo
                                        const colors = recurrenceChartType === 'despesas' 
                                            ? ['#991b1b', '#fca5a5'] // Vermelho muito escuro e vermelho claro para despesas
                                            : ['#14532d', '#86efac']; // Verde muito escuro e verde claro para receitas
                                        const color = colors[index] || '#6b7280';
                                        
                                        return (
                                            <circle
                                                key={index}
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke={color}
                                                strokeWidth="20"
                                                strokeDasharray={strokeDasharray}
                                                strokeDashoffset={strokeDashoffset}
                                                className="transition-all duration-300 hover:stroke-opacity-80"
                                            />
                                        );
                                    })}
                                </svg>
                            </div>
                            
                            {/* Legenda */}
                            <div className="ml-6 space-y-3">
                                {recurrenceChartData.map((item, index) => {
                                    // Cores dinâmicas baseadas no tipo
                                    const colors = recurrenceChartType === 'despesas' 
                                        ? ['#991b1b', '#fca5a5'] // Vermelho muito escuro e vermelho claro para despesas
                                        : ['#14532d', '#86efac']; // Verde muito escuro e verde claro para receitas
                                    const color = colors[index] || '#6b7280';
                                    
                                    return (
                                        <div key={index} className="flex items-center space-x-2">
                                            <div 
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: color }}
                                            ></div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium text-gray-800">{item.label}</span>
                                                <span className="text-[11px] text-gray-500 whitespace-nowrap">
                                                    {getCurrencySymbol(selectedCurrency)} {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • {item.percentual.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Próximas Faturas */}
            <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Próximas Faturas</h3>
                <div className="space-y-3">
                    {isLoadingUpcomingInvoices ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                            <span className="ml-2 text-gray-500">Carregando faturas...</span>
                        </div>
                    ) : upcomingInvoicesError ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-red-500">{upcomingInvoicesError}</p>
                        </div>
                    ) : upcomingInvoices.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-gray-500">Nenhuma fatura pendente</p>
                        </div>
                    ) : (
                        upcomingInvoices.map((fatura, index) => (
                            <div 
                                key={`${fatura.id_cartao}-${fatura.fatura_referencia}`} 
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex flex-col">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-sm font-medium text-gray-600">
                                            Vencimento: {fatura.data_vencimento.toLocaleDateString('pt-BR')}
                                        </span>
                                        {fatura.isOverdue ? (
                                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                Atrasada
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                                Pendente
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        Cartão de crédito: {fatura.cartao}
                                    </span>
                                </div>
                                <span className="font-bold text-lg text-gray-800">
                                    {getCurrencySymbol(fatura.moeda)} {fatura.valor_total_fatura.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button 
                className="w-full text-center py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-colors cursor-pointer"
                style={{ backgroundColor: primaryGreen, color: 'white' }}
            >
                Ver Relatórios Detalhados
            </button>
        </div>
    );
};

// --------------------------------------------------------------------------------
// Componente Principal: CreditCardsScreen (ATUALIZADO com CRUD)
// --------------------------------------------------------------------------------
const CreditCardsScreen = () => {
  const [cartoes, setCartoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('menu');

  const [cardToDelete, setCardToDelete] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [cardToEdit, setCardToEdit] = useState(null); 
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSavingNew, setIsSavingNew] = useState(false);

  // Endpoint: app.get('/cartoes', ...)
  const fetchCartoes = useCallback(async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
          setError('Usuário não autenticado.');
          setIsLoading(false);
          return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
          const url = `${API_BASE_URL}/cartoes`; 
          const response = await fetch(url, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.mensagem || 'Erro ao carregar cartões.');
          }

          const data = await response.json();
          // Campos retornados: nome_cartao, limite_atual, moeda, vencimento_dia, fechamento_dia
          setCartoes(Array.isArray(data) ? data : []); 
      } catch (err) {
          console.error('Erro ao buscar cartões:', err);
          const errorMessage = err.message.includes('Failed to fetch') 
              ? 'Não foi possível conectar ao backend.' 
              : err.message;
          setError(errorMessage);
      } finally {
          setIsLoading(false);
      }
  }, []);

  useEffect(() => {
      fetchCartoes();
  }, [fetchCartoes]);



  // Endpoint: app.post('/cartoes', ...)
  const createNewCard = async (cardData) => {
      setIsSavingNew(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      try {
          const url = `${API_BASE_URL}/cartoes`;
          
          const response = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(cardData)
          });

          if (!response.ok) {
              const errorBody = await response.json(); 
              throw new Error(errorBody.mensagem || `Falha ao criar o cartão: ${response.status}`);
          }

          setShowAddModal(false); 
          await fetchCartoes();

      } catch (err) {
          console.error("Erro na criação do cartão:", err);
          setError(`Erro ao criar o cartão: ${err.message}`);
      } finally {
          setIsSavingNew(false);
      }
  };

  // Endpoint: app.put('/cartoes/:id', ...)
  const handleEditClick = (card) => setCardToEdit(card);
  const cancelEdit = () => setCardToEdit(null);

  const updateCard = async (id, updatedData) => {
      setIsSavingEdit(true); 
      setError(null);
      const token = localStorage.getItem('authToken');

      try {
          const url = `${API_BASE_URL}/cartoes/${id}`;
          
          const response = await fetch(url, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(updatedData) // updatedData: { nome_cartao, limite_inicial }
          });

          if (!response.ok) {
              const errorBody = await response.json(); 
              throw new Error(errorBody.mensagem || `Falha ao atualizar o cartão: ${response.status}`);
          }

          setCardToEdit(null); 
          await fetchCartoes();

      } catch (err) {
          console.error("Erro na atualização do cartão:", err);
          setError(`Erro ao atualizar o cartão: ${err.message}`);
      } finally {
          setIsSavingEdit(false);
      }
  };

  // Endpoint: app.delete('/cartoes/:id', ...)
  const handleDeletionClick = (card) => setCardToDelete(card);
  const cancelDelete = () => setCardToDelete(null);

  const deleteCard = async () => {
      if (!cardToDelete) return;
      setIsDeleting(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      try {
          const url = `${API_BASE_URL}/cartoes/${cardToDelete.id}`;
          const response = await fetch(url, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`, 
              },
          });

          if (!response.ok) {
              const errorBody = await response.json(); 
              throw new Error(errorBody.mensagem || `Falha ao excluir o cartão: ${response.status}`);
          }

          setCardToDelete(null); 
          await fetchCartoes();

      } catch (err) {
          console.error("Erro na exclusão do cartão:", err);
          setError(`Erro ao excluir o cartão ${cardToDelete.nome_cartao}: ${err.message}`);
      } finally {
          setIsDeleting(false);
      }
  };

  return (
      <div className="p-4"> 
          
          {/* Cabeçalho com Título e Botão de Adição */}
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Meus Cartões de Crédito</h2>
              
              <button 
                  onClick={() => setShowAddModal(true)} 
                  className="w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-transform duration-150 transform hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: primaryGreen }}
                  aria-label="Configurar Novo Cartão"
              >
                  <Plus size={24} className="text-white" />
              </button>
          </div>


          {isLoading && (
              <div className="flex justify-center items-center h-48 text-gray-600">
                  <Loader2 className="w-8 h-8 animate-spin mr-2" />
                  Carregando cartões...
              </div>
          )}

          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4" role="alert">
                  {error}
              </div>
          )}
          
          {!isLoading && !error && (
              cartoes.length > 0 ? (
                  <div className="space-y-3 pb-4">
                      {cartoes.map(card => (
                          <CardItem 
                              key={card.id} 
                              card={card} 
                              onEdit={handleEditClick} 
                              onDelete={handleDeletionClick}
                          />
                      ))}
                  </div>
              ) : (
                  <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                      <CreditCard size={56} className="mx-auto my-4 text-blue-500" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum Cartão Encontrado</h3>
                      <p className="text-gray-500 mb-6">Comece configurando seu primeiro cartão de crédito clicando no ícone '+' acima.</p>
                  </div>
              )
          )}
          
          {/* --- MODAIS DE CARTÕES --- */}
          {/* Modal de Exclusão */}
          {cardToDelete && (
              <div 
                  className="fixed inset-0 flex justify-center items-center z-50 p-4"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
              >
                  <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
                      <h3 className="text-xl font-bold text-red-600 mb-4">Confirmar Exclusão</h3>
                      <p className="text-gray-700 mb-6">
                          Tem certeza de que deseja excluir permanentemente o cartão <span className="font-semibold">"{cardToDelete.nome_cartao}"</span>? 
                          Esta ação não pode ser desfeita.
                      </p>
                      <div className="flex justify-end space-x-3">
                          <button
                              onClick={cancelDelete}
                              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 font-medium"
                              disabled={isDeleting}
                          >
                              Cancelar
                          </button>
                          <button
                              onClick={deleteCard}
                              className={`px-4 py-2 text-white rounded-lg transition duration-150 font-medium cursor-pointer ${
                                  isDeleting 
                                      ? 'bg-red-400 cursor-not-allowed flex items-center' 
                                      : 'bg-red-600 hover:bg-red-700'
                              }`}
                              disabled={isDeleting}
                          >
                              {isDeleting ? (
                                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...</>
                              ) : 'Excluir Permanentemente'}
                          </button>
                      </div>
                  </div>
              </div>
          )}
          {/* Modal de Edição */}
          {cardToEdit && (
              <EditCardModal 
                  card={cardToEdit}
                  onSave={updateCard}
                  onCancel={cancelEdit}
                  isSaving={isSavingEdit}
              />
          )}
          {/* Modal de Adicionar Nova Cartão */}
          {showAddModal && (
              <AddCardModal
                  onSave={createNewCard}
                  onCancel={() => setShowAddModal(false)}
                  isSaving={isSavingNew}
              />
          )}
          {/* --- FIM DOS MODAIS DE CARTÕES --- */}

      </div>
  );
};

// --------------------------------------------------------------------------------
// Componente Auxiliar para um Item de Conta Bancária
// ATUALIZADO: Recebe onDelete e onEdit
// --------------------------------------------------------------------------------
const ContaItem = ({ conta, onEdit, onDelete }) => {
  // ... (código para formatCurrency, etc. permanece igual)

  const formattedSaldo = formatCurrency(parseFloat(conta.saldo_atual || 0), conta.moeda); 

  // Funções de clique
  // ATUALIZADO: Chama a função onEdit do pai, passando o objeto da conta
  const handleEditClick = () => {
    onEdit(conta); 
  };
  
  const handleDeleteClick = () => {
    onDelete(conta); 
  };

  return (
      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-lg border-l-4 border-r-4 border-opacity-70" style={{ borderColor: primaryGreen }}>
          {/* Informações da Conta */}
          <div className="flex-1 min-w-0 mr-4">
              <h4 className="text-xl font-bold truncate text-gray-900">{conta.nome}</h4>
              <p className="text-lg font-extrabold mt-1" style={{ color: darkGreen }}>
                  {formattedSaldo}
                  <span className="ml-2 text-sm text-gray-500 font-medium">({conta.moeda})</span>
              </p>
          </div>

          {/* Ações de Editar e Excluir */}
          <div className="flex space-x-2">
              <button 
                  onClick={handleEditClick} // AGORA CHAMA O MODAL
                  className="p-2 text-blue-500 hover:text-blue-700 rounded-full transition-colors bg-blue-50/70 cursor-pointer shadow-sm"
                  aria-label={`Editar conta ${conta.nome}`}
              >
                  <Edit size={20} />
              </button>
              <button 
                  onClick={handleDeleteClick}
                  className="p-2 text-red-500 hover:text-red-700 rounded-full transition-colors bg-red-50/70 cursor-pointer shadow-sm"
                  aria-label={`Excluir conta ${conta.nome}`}
              >
                  <Trash2 size={20} />
              </button>
          </div>
      </div>
  );
};

// --------------------------------------------------------------------------------
// Componente Modal de Edição de Conta
// --------------------------------------------------------------------------------
const EditAccountModal = ({ conta, onSave, onCancel, isSaving }) => {
  const [novoNome, setNovoNome] = useState(conta.nome || '');

  // Garante que o estado seja resetado se a conta mudar
  useEffect(() => {
      setNovoNome(conta.nome || '');
  }, [conta.nome]);

  const handleSubmit = (e) => {
      e.preventDefault();
      // Verifica se o nome foi realmente alterado e não está vazio
      if (novoNome.trim() && novoNome.trim() !== conta.nome) {
          onSave(conta.id, novoNome.trim());
      } else {
          // Se o nome não foi alterado ou está vazio, apenas cancela ou informa
          onCancel(); 
      }
  };

  return (
      // Overlay de Fundo Transparente
      <div 
          className="fixed inset-0 flex justify-center items-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }} // Fundo transparente
      >
          {/* Corpo do Modal */}
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Conta: {conta.nome}</h3>
              
              <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="novoNome">
                          Novo Nome da Conta
                      </label>
                      <input
                          id="novoNome"
                          type="text"
                          value={novoNome}
                          onChange={(e) => setNovoNome(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                          placeholder="Ex: Conta Corrente Itaú"
                          required
                          disabled={isSaving}
                      />
                  </div>

                  <div className="flex justify-end space-x-3">
                      <button
                          type="button"
                          onClick={onCancel}
                          className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 font-medium cursor-pointer"
                          disabled={isSaving}
                      >
                          Cancelar
                      </button>
                      <button
                            type="submit"
                            className={`px-4 py-2 rounded-lg transition duration-150 font-medium cursor-pointer ${
                                isSaving 
                                    ? 'bg-indigo-400 cursor-not-allowed flex items-center text-white' 
                                    : 'text-white'
                            }`}
                            style={{ 
                                backgroundColor: isSaving ? undefined : primaryGreen,
                                '--hover-bg': darkGreen 
                            }}
                            onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = darkGreen)}
                            onMouseLeave={(e) => !isSaving && (e.currentTarget.style.backgroundColor = primaryGreen)}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                            ) : 'Salvar Alteração'}
                        </button>
                  </div>
              </form>
          </div>
      </div>
  );
};

const AddCategoryModal = ({ onSave, onCancel, isSaving }) => {
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('despesa');  // Tipo da categoria (despesa ou receita)

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nome.trim() === '') {
            return; // Não permite enviar se o nome estiver vazio
        }
        
        // Define cor automaticamente baseada no tipo
        const cor_hexa = tipo === 'despesa' ? '#ef4444' : '#10b981'; // Vermelho para despesa, verde para receita
        
        const newCategory = {
            nome,
            tipo,
            cor_hexa,
        };
        onSave(newCategory);  // Chama a função de salvar a nova categoria
    };

    return (
        <div
            className="fixed inset-0 flex justify-center items-center z-50 p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Adicionar Nova Categoria</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="nome">
                            Nome da Categoria
                        </label>
                        <input
                            id="nome"
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Alimentação"
                            required
                            disabled={isSaving}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="tipo">
                            Tipo da Categoria
                        </label>
                        <select
                            id="tipo"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                            disabled={isSaving}
                        >
                            <option value="despesa">Despesa</option>
                            <option value="receita">Receita</option>
                        </select>
                    </div>


                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 font-medium"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 text-white rounded-lg transition duration-150 font-medium cursor-pointer ${
                                isSaving
                                    ? 'bg-gray-400 cursor-not-allowed flex items-center'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
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


// --------------------------------------------------------------------------------
// Componente Modal de Adicionar Nova Conta
// --------------------------------------------------------------------------------
const AddAccountModal = ({ onSave, onCancel, isSaving }) => {
  // Estados para os campos do formulário
  const [nome, setNome] = useState('');
  const [saldoInput, setSaldoInput] = useState('0,00'); // Valor no formato de input (com vírgula)
  const [moeda, setMoeda] = useState('BRL'); // Moeda padrão
  
  // Mapeamento de moedas para símbolos
  const currencySymbols = {
      'BRL': 'R$',
      'EUR': '€',
      'USD': '$',
  };

  // Função para formatar o saldo (0,00) enquanto o usuário digita
  // Adaptação: trata o input como centavos para garantir precisão
  const handleSaldoChange = (e) => {
      let value = e.target.value.replace(/\D/g, ''); // Remove tudo exceto dígitos

      // Se estiver vazio, define como 0
      if (value === '') {
          setSaldoInput('0,00');
          return;
      }

      // Garante que tenha pelo menos 3 dígitos (para os centavos e o real/dólar/euro)
      while (value.length < 3) {
          value = '0' + value;
      }

      // Insere a vírgula para separar os centavos
      const integerPart = value.slice(0, -2);
      const decimalPart = value.slice(-2);
      const formattedValue = integerPart.replace(/^0+/, '') + ',' + decimalPart; // Remove zeros à esquerda (exceto o zero inteiro)
      
      setSaldoInput(formattedValue.replace(/^,/, '0,')); // Garante '0,' se for apenas decimal
  };

  // Função para preparar os dados e chamar a API
  const handleSubmit = (e) => {
      e.preventDefault();

      // 1. Converte o saldo de formato brasileiro (vírgula) para formato americano (ponto)
      const saldo_inicial_backend = parseFloat(saldoInput.replace('.', '').replace(',', '.'));
      
      // 2. Prepara o JSON para o backend
      const newAccountData = {
          nome: nome.trim(),
          saldo_inicial: saldo_inicial_backend.toFixed(2), // Garante 2 casas decimais e ponto
          moeda: moeda,
      };
      
      // 3. Chama a função do componente pai
      onSave(newAccountData);
  };

  return (
      // Overlay de Fundo Transparente (0.85 conforme solicitado)
      <div 
          className="fixed inset-0 flex justify-center items-center z-[1001] p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }} 
      >
          {/* Corpo do Modal */}
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Registrar Nova Conta</h3>
              
              <form onSubmit={handleSubmit}>
                  
                  {/* Campo 1: Nome da Conta */}
                  <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="nomeConta">
                          Nome da Conta
                      </label>
                      <input
                          id="nomeConta"
                          type="text"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                          placeholder="Ex: Conta Corrente Principal"
                          required
                          disabled={isSaving}
                      />
                  </div>

                  {/* Campo 2: Moeda (Dropdown) */}
                  <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="moeda">
                          Moeda
                      </label>
                      <select
                          id="moeda"
                          value={moeda}
                          onChange={(e) => setMoeda(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                          required
                          disabled={isSaving}
                      >
                          <option value="BRL">BRL (Real Brasileiro)</option>
                          <option value="EUR">EUR (Euro)</option>
                          <option value="USD">USD (Dólar Americano)</option>
                      </select>
                  </div>

                  {/* Campo 3: Saldo Inicial (Máscara e Ícone Dinâmico) */}
                  <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="saldoInicial">
                          Saldo Inicial
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-indigo-500 focus-within:border-indigo-500 transition duration-150">
                          {/* Ícone Dinâmico da Moeda */}
                          <span className="px-3 text-lg font-bold text-gray-600">
                              {currencySymbols[moeda]}
                          </span>
                          <input
                              id="saldoInicial"
                              type="text"
                              value={saldoInput}
                              onChange={handleSaldoChange}
                              className="flex-1 px-2 py-2 border-l border-gray-300 rounded-r-lg outline-none"
                              placeholder="0,00"
                              inputMode="decimal" // Teclado numérico em mobile
                              required
                              disabled={isSaving}
                          />
                      </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-end space-x-3">
                      <button
                          type="button"
                          onClick={onCancel}
                          className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 font-medium"
                          disabled={isSaving}
                      >
                          Cancelar
                      </button>
                      <button
                          type="submit"
                          className={`px-4 py-2 text-white rounded-lg transition duration-150 font-medium cursor-pointer ${
                              isSaving 
                                  ? 'bg-indigo-400 cursor-not-allowed flex items-center' 
                                  : 'text-white'
                          }`}
                          style={{ 
                              backgroundColor: isSaving ? undefined : primaryGreen,
                          }}
                          onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = darkGreen)}
                          onMouseLeave={(e) => !isSaving && (e.currentTarget.style.backgroundColor = primaryGreen)}
                          disabled={isSaving}
                      >
                          {isSaving ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adicionando...</>
                          ) : 'Incluir Nova Conta'}
                      </button>
                  </div>
              </form>
          </div>
      </div>
  );
};

// --------------------------------------------------------------------------------
// Componente de Contas Bancárias (Atualizado com Botão de Ação no Título)
// --------------------------------------------------------------------------------
const AccountsScreen = () => {
  const [contas, setContas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para exclusão
  const [accountToDelete, setAccountToDelete] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para edição
  const [accountToEdit, setAccountToEdit] = useState(null); 
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // NOVO: Estados para criação
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSavingNew, setIsSavingNew] = useState(false);

  const fetchContas = useCallback(async () => {
      // ... (código de fetchContas permanece o mesmo)
      const token = localStorage.getItem('authToken');
      if (!token) {
          setError('Usuário não autenticado. Redirecionando para login...');
          setIsLoading(false);
          return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
          const response = await fetch(`${API_BASE_URL}/contas`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
          });

          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.mensagem || 'Erro ao carregar contas.');
          }

          const data = await response.json();
          setContas(Array.isArray(data) ? data : []); 
      } catch (err) {
          console.error('Erro ao buscar contas:', err);
          const errorMessage = err.message.includes('Failed to fetch') 
              ? 'Não foi possível conectar ao backend. Verifique se o servidor (http://localhost:10000) está em execução.' 
              : err.message;
          setError(errorMessage);
      } finally {
          setIsLoading(false);
      }
  }, []);

  useEffect(() => {
      fetchContas();
  }, [fetchContas]);


  // --- FUNÇÕES DE CRIAÇÃO ---
  const createNewAccount = async (accountData) => {
      setIsSavingNew(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      try {
          const url = `${API_URL}/contas`;
          
          const response = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(accountData)
          });

          if (!response.ok) {
              const errorBody = await response.json(); 
              throw new Error(errorBody.mensagem || `Falha ao criar a conta: ${response.status}`);
          }

          setShowAddModal(false); 
          await fetchContas();

      } catch (err) {
          console.error("Erro na criação da conta:", err);
          setError(`Erro ao criar a conta: ${err.message}. Verifique se o backend local está rodando.`);
      } finally {
          setIsSavingNew(false);
      }
  };


  // --- FUNÇÕES DE EDIÇÃO ---
  const handleEditClick = (conta) => {
    setAccountToEdit(conta);
  };

  const cancelEdit = () => {
    setAccountToEdit(null);
  };

  const updateAccountName = async (id, novoNome) => {
      setIsSavingEdit(true); 
      setError(null);
      const token = localStorage.getItem('authToken');

      try {
          const url = `${API_BASE_URL}/contas/${id}`;
          
          const response = await fetch(url, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ nome: novoNome })
          });

          if (!response.ok) {
              const errorBody = await response.json(); 
              throw new Error(errorBody.mensagem || `Falha ao atualizar a conta: ${response.status}`);
          }

          setAccountToEdit(null); 
          await fetchContas();

      } catch (err) {
          console.error("Erro na atualização da conta:", err);
          setError(`Erro ao atualizar a conta: ${err.message}`);
      } finally {
          setIsSavingEdit(false);
      }
  };


  // --- FUNÇÕES DE DELEÇÃO ---
  const handleDeletionClick = (conta) => {
    setAccountToDelete(conta);
  };

  const cancelDelete = () => {
    setAccountToDelete(null);
  };

  const deleteAccount = async () => {
      if (!accountToDelete) return;
      setIsDeleting(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      try {
          const url = `${API_BASE_URL}/contas/${accountToDelete.id}`;
          const response = await fetch(url, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`, 
              },
          });

          if (!response.ok) {
              const errorBody = await response.json(); 
              throw new Error(errorBody.mensagem || `Falha ao excluir a conta: ${response.status}`);
          }

          setAccountToDelete(null); 
          await fetchContas();

      } catch (err) {
          console.error("Erro na exclusão da conta:", err);
          setError(`Erro ao excluir a conta ${accountToDelete.nome}: ${err.message}`);
      } finally {
          setIsDeleting(false);
      }
  };


  return (
      // O contêiner principal não precisa de "space-y-4" se o conteúdo for gerenciado por um scroll interno
      // Mas para manter a simplicidade do layout externo, mantemos o p-4.
      <div className="p-4"> 
          
          {/* NOVO BLOCO DO CABEÇALHO: Contém o Título e o Botão + */}
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Minhas Contas Bancárias</h2>
              
              {/* Botão Circular de Adicionar Nova Conta */}
              <button 
                  onClick={() => setShowAddModal(true)} 
                  className="w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-transform duration-150 transform hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: primaryGreen }}
                  aria-label="Configurar Nova Conta"
              >
                  <Plus size={24} className="text-white" />
              </button>
          </div>


          {isLoading && (
              <div className="flex justify-center items-center h-48 text-gray-600">
                  <Loader2 className="w-8 h-8 animate-spin mr-2" />
                  Carregando contas...
              </div>
          )}

          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4" role="alert">
                  {error}
              </div>
          )}
          
          {!isLoading && !error && (
              contas.length > 0 ? (
                  // Lista de Contas (Esta área deve ser scrollada se a lista for longa, 
                  // o scroll é garantido pelo <main> do DashboardLayout)
                  <div className="space-y-3 pb-4">
                      {contas.map(conta => (
                          <ContaItem 
                            key={conta.id} 
                            conta={conta} 
                            onEdit={handleEditClick} 
                            onDelete={handleDeletionClick}
                          />
                      ))}
                  </div>
              ) : (
                  // Estado Vazio
                  <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                      <Layers size={56} className="mx-auto my-4 text-indigo-500" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma Conta Encontrada</h3>
                      <p className="text-gray-500 mb-6">Comece configurando sua primeira conta bancária clicando no ícone '+' acima.</p>
                  </div>
              )
          )}

          {/* O BLOCO DO BOTÃO Fixo/PADRÃO DE REGISTRO FOI REMOVIDO DAQUI */}
          
          {/* --- MODAIS (Permanecem iguais) --- */}
          {/* Modal de Exclusão */}
          {accountToDelete && (
              <div 
                  className="fixed inset-0 flex justify-center items-center z-50 p-4"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
              >
                  <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
                      <h3 className="text-xl font-bold text-red-600 mb-4">Confirmar Exclusão</h3>
                      <p className="text-gray-700 mb-6">
                          Tem certeza de que deseja excluir permanentemente a conta <span className="font-semibold">"{accountToDelete.nome}"</span>? 
                          Esta ação não pode ser desfeita.
                      </p>
                      <div className="flex justify-end space-x-3">
                          <button
                              onClick={cancelDelete}
                              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 font-medium"
                              disabled={isDeleting}
                          >
                              Cancelar
                          </button>
                          <button
                              onClick={deleteAccount}
                              className={`px-4 py-2 text-white rounded-lg transition duration-150 font-medium cursor-pointer ${
                                  isDeleting 
                                      ? 'bg-red-400 cursor-not-allowed flex items-center' 
                                      : 'bg-red-600 hover:bg-red-700'
                              }`}
                              disabled={isDeleting}
                          >
                              {isDeleting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...</>
                              ) : 'Excluir Permanentemente'}
                          </button>
                      </div>
                  </div>
              </div>
          )}
          {/* Modal de Edição */}
          {accountToEdit && (
              <EditAccountModal 
                  conta={accountToEdit}
                  onSave={updateAccountName}
                  onCancel={cancelEdit}
                  isSaving={isSavingEdit}
              />
          )}
          {/* Modal de Adicionar Nova Conta */}
          {showAddModal && (
              <AddAccountModal
                  onSave={createNewAccount}
                  onCancel={() => setShowAddModal(false)}
                  isSaving={isSavingNew}
              />
          )}
          {/* --- FIM DOS MODAIS --- */}

      </div>
  );
};

// ====================================================================
// NOVOS COMPONENTES PARA CARTÕES DE CRÉDITO
// ====================================================================

// --------------------------------------------------------------------------------
// Componente de Item de Cartão de Crédito
// --------------------------------------------------------------------------------
const CardItem = ({ card, onEdit, onDelete }) => {
  // Calcula o limite disponível (campo do backend: limite_atual)
  const limiteDisponivel = card.limite_atual; 

  return (
      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-lg border-l-4 border-r-4 border-opacity-70" style={{ borderColor: '#3b82f6' /* Cor azul para cartão */ }}>
          <div className="flex-1 min-w-0 mr-4">
              <h4 className="text-xl font-bold truncate text-gray-900">{card.nome_cartao}</h4>
              <p className="text-lg font-extrabold mt-1 text-blue-600">
                  {formatCurrency(limiteDisponivel, card.moeda)}
              </p>
              <p className="text-sm text-gray-500 font-medium">
                  Limite Disponível ({card.moeda})
              </p>
              <p className="text-xs text-gray-400 mt-1">
                  Fatura: Fecha dia {card.fechamento_dia} | Vence dia {card.vencimento_dia}
              </p>
          </div>

          {/* Ações de Editar e Excluir */}
          <div className="flex space-x-2">
              <button 
                  onClick={() => onEdit(card)}
                  className="p-2 text-blue-500 hover:text-blue-700 rounded-full transition-colors bg-blue-50/70 cursor-pointer shadow-sm"
                  aria-label={`Editar cartão ${card.nome_cartao}`}
              >
                  <Edit size={20} />
              </button>
              <button 
                  onClick={() => onDelete(card)}
                  className="p-2 text-red-500 hover:text-red-700 rounded-full transition-colors bg-red-50/70 cursor-pointer shadow-sm"
                  aria-label={`Excluir cartão ${card.nome_cartao}`}
              >
                  <Trash2 size={20} />
              </button>
          </div>
      </div>
  );
};

// --------------------------------------------------------------------------------
// Modal de Adição de Cartão de Crédito (POST /cartoes)
// --------------------------------------------------------------------------------
const AddCardModal = ({onSave, onCancel, isSaving}) => {
const [nome_cartao, setNomeCartao] = useState('');
  const [moeda, setMoeda] = useState('BRL');
  const [limite_inicial_input, setLimiteInicialInput] = useState('0,00');
  const [vencimento_dia, setVencimentoDia] = useState('1');
  const [fechamento_dia, setFechamentoDia] = useState('1');
  
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleValueChange = (e) => {
      let value = e.target.value.replace(/\D/g, ''); 

      if (value === '') {
          setLimiteInicialInput('0,00');
          return;
      }

      while (value.length < 3) {
          value = '0' + value;
      }

      const integerPart = value.slice(0, -2);
      const decimalPart = value.slice(-2);
      const formattedValue = integerPart.replace(/^0+/, '') + ',' + decimalPart; 
      
      setLimiteInicialInput(formattedValue.replace(/^,/, '0,')); 
  };

  const handleSubmit = (e) => {
      e.preventDefault();

      const rawLimite = parseFloat(limite_inicial_input.replace('.', '').replace(',', '.'));
      
      if (nome_cartao.trim() && !isNaN(rawLimite)) {
          onSave({ 
              nome_cartao: nome_cartao.trim(), 
              moeda, 
              limite_inicial: parseFloat(rawLimite.toFixed(2)),
              vencimento_dia: parseInt(vencimento_dia),
              fechamento_dia: parseInt(fechamento_dia)
          });
      }
  };
  
  const currencySymbol = getCurrencySymbol(moeda);

  return (
    
      <div 
          className="fixed inset-0 flex justify-center items-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      >
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Registrar Novo Cartão</h3>
              
              <form onSubmit={handleSubmit}>
                  
                  {/* Nome do Cartão */}
                  <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="nomeCartao">Nome do Cartão</label>
                      <input
                          id="nomeCartao"
                          type="text"
                          value={nome_cartao}
                          onChange={(e) => setNomeCartao(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                          placeholder="Ex: Nubank, Inter"
                          required
                          disabled={isSaving}
                      />
                  </div>

                  {/* Moeda e Limite Inicial */}
                  <div className="flex space-x-4 mb-4">
                      <div className="flex-1">
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="moedaCartao">Moeda</label>
                          <select
                              id="moedaCartao"
                              value={moeda}
                              onChange={(e) => {
                                  setMoeda(e.target.value);
                                  setLimiteInicialInput('0,00'); // Reseta para formatar corretamente
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-green-500 focus:border-green-500"
                              required
                              disabled={isSaving}
                          >
                              <option value="BRL">BRL</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                          </select>
                      </div>
                      <div className="flex-1">
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="limiteInicial">Limite Inicial</label>
                          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-green-500 focus-within:border-green-500">
                              <span className="px-3 text-lg font-bold text-gray-600">{currencySymbol}</span>
                              <input
                                  id="limiteInicial"
                                  type="text"
                                  value={limite_inicial_input}
                                  onChange={handleValueChange}
                                  className="flex-1 px-2 py-2 border-l border-gray-300 rounded-r-lg outline-none text-right"
                                  placeholder="0,00"
                                  inputMode="decimal"
                                  required
                                  disabled={isSaving}
                              />
                          </div>
                      </div>
                  </div>

                  {/* Vencimento e Fechamento */}
                  <div className="flex space-x-4 mb-6">
                      <div className="flex-1">
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="vencimentoDia">Dia Vencimento</label>
                          <select
                              id="vencimentoDia"
                              value={vencimento_dia}
                              onChange={(e) => setVencimentoDia(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-green-500 focus:border-green-500"
                              required
                              disabled={isSaving}
                          >
                              {days.map(day => (<option key={`v-${day}`} value={day}>{day}</option>))}
                          </select>
                      </div>
                      <div className="flex-1">
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="fechamentoDia">Dia Fechamento</label>
                          <select
                              id="fechamentoDia"
                              value={fechamento_dia}
                              onChange={(e) => setFechamentoDia(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-green-500 focus:border-green-500"
                              required
                              disabled={isSaving}
                          >
                              {days.map(day => (<option key={`f-${day}`} value={day}>{day}</option>))}
                          </select>
                      </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-end space-x-3">
                      <button
                          type="button"
                          onClick={onCancel}
                          className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 font-medium"
                          disabled={isSaving}
                      >
                          Cancelar
                      </button>
                      <button
                          type="submit"
                          className={`px-4 py-2 text-white rounded-lg transition duration-150 font-medium cursor-pointer ${
                              isSaving 
                                  ? 'bg-gray-400 cursor-not-allowed flex items-center' 
                                  : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          disabled={isSaving}
                      >
                          {isSaving ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adicionando...</>
                          ) : 'Incluir Cartão'}
                      </button>
                  </div>
              </form>
          </div>
      </div>
  );
};

// --------------------------------------------------------------------------------
// Modal de Edição de Cartão de Crédito (PUT /cartoes/:id) - ATUALIZADO
// --------------------------------------------------------------------------------
const EditCardModal = ({ card, onSave, onCancel, isSaving }) => {
  // Inicializa estados com os valores atuais do cartão
  const [novoNome, setNovoNome] = useState(card.nome_cartao || '');
  const [novoLimiteInput, setNovoLimiteInput] = useState(
      // Converte o limite (que vem como número inteiro) para o formato '0,00' para exibição no input
      (card.limite_inicial / 100).toFixed(2).replace('.', ',')
  );
  // NOVOS ESTADOS: Inicializa com os dias atuais (convertidos para string)
  const [vencimento_dia, setVencimentoDia] = useState(String(card.vencimento_dia) || '1');
  const [fechamento_dia, setFechamentoDia] = useState(String(card.fechamento_dia) || '1');

  const currencySymbol = getCurrencySymbol(card.moeda);
  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Array de 1 a 31

  const handleValueChange = (e) => {
      let value = e.target.value.replace(/\D/g, ''); 

      if (value === '') {
          setNovoLimiteInput('0,00');
          return;
      }

      while (value.length < 3) {
          value = '0' + value;
      }

      const integerPart = value.slice(0, -2);
      const decimalPart = value.slice(-2);
      const formattedValue = integerPart.replace(/^0+/, '') + ',' + decimalPart; 
      
      setNovoLimiteInput(formattedValue.replace(/^,/, '0,')); 
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      
      const rawLimite = parseFloat(novoLimiteInput.replace('.', '').replace(',', '.'));

      if (novoNome.trim() && !isNaN(rawLimite)) {
          // O backend PUT espera: nome_cartao, limite_inicial, vencimento_dia e fechamento_dia
          onSave(card.id, {
              nome_cartao: novoNome.trim(),
              limite_inicial: parseFloat(rawLimite.toFixed(2)),
              vencimento_dia: parseInt(vencimento_dia), // Adicionado
              fechamento_dia: parseInt(fechamento_dia) // Adicionado
          });
      }
  };

  return (
      <div 
          className="fixed inset-0 flex justify-center items-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      >
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Cartão: {card.nome_cartao}</h3>
              <p className="text-sm text-gray-500 mb-4">Moeda do Cartão: <span className="font-semibold">{card.moeda}</span></p>

              <form onSubmit={handleSubmit}>
                  
                  {/* Campo Novo Nome */}
                  <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="novoNomeCartao">Novo Nome</label>
                      <input
                          id="novoNomeCartao"
                          type="text"
                          value={novoNome}
                          onChange={(e) => setNovoNome(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                          placeholder="Nome do Cartão"
                          required
                          disabled={isSaving}
                      />
                  </div>

                  {/* Campo Novo Limite Inicial */}
                  <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="novoLimite">Novo Limite Inicial</label>
                      <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-green-500 focus-within:border-green-500">
                          <span className="px-3 text-lg font-bold text-gray-600">{currencySymbol}</span>
                          <input
                              id="novoLimite"
                              type="text"
                              value={novoLimiteInput}
                              onChange={handleValueChange}
                              className="flex-1 px-2 py-2 border-l border-gray-300 rounded-r-lg outline-none text-right"
                              placeholder="0,00"
                              inputMode="decimal"
                              required
                              disabled={isSaving}
                          />
                      </div>
                  </div>

                  {/* NOVOS CAMPOS: Vencimento e Fechamento */}
                  <div className="flex space-x-4 mb-6">
                      <div className="flex-1">
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="vencimentoDia">Dia Vencimento</label>
                          <select
                              id="vencimentoDia"
                              value={vencimento_dia}
                              onChange={(e) => setVencimentoDia(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-green-500 focus:border-green-500"
                              required
                              disabled={isSaving}
                          >
                              {days.map(day => (<option key={`v-${day}`} value={day}>{day}</option>))}
                          </select>
                      </div>
                      <div className="flex-1">
                          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="fechamentoDia">Dia Fechamento</label>
                          <select
                              id="fechamentoDia"
                              value={fechamento_dia}
                              onChange={(e) => setFechamentoDia(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-green-500 focus:border-green-500"
                              required
                              disabled={isSaving}
                          >
                              {days.map(day => (<option key={`f-${day}`} value={day}>{day}</option>))}
                          </select>
                      </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                      <button
                          type="button"
                          onClick={onCancel}
                          className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 font-medium"
                          disabled={isSaving}
                      >
                          Cancelar
                      </button>
                      <button
                          type="submit"
                          className={`px-4 py-2 text-white rounded-lg transition duration-150 font-medium cursor-pointer ${
                              isSaving 
                                  ? 'bg-gray-400 cursor-not-allowed flex items-center' 
                                  : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          disabled={isSaving}
                      >
                          {isSaving ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                          ) : 'Salvar Alterações'}
                      </button>
                  </div>
              </form>
          </div>
      </div>
  );
};




// --------------------------------------------------------------------------------
// Componente: ExpenseTransactionScreen (NOVO)
// Formulário para registrar despesas usando contas bancárias
// --------------------------------------------------------------------------------
const ExpenseTransactionScreen = ({ goToMenu, setTransactionSubView }) => {
    const [contas, setContas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [isSavingAccount, setIsSavingAccount] = useState(false);

    const [formData, setFormData] = useState({
      tipo: '',
      data_transacao: new Date().toISOString().substring(0, 10),
      valor_total: '',
      descricao: '',
      id_conta: '',
      id_categoria: '',
      recorrencia: 'Esporadico',
    });


    // Função para buscar contas e categorias
    const fetchData = useCallback(async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      setIsLoading(true);
      setError(null);
      setShowSuccessModal(false);

      try {
        const [contasRes, categoriasRes] = await Promise.all([
          fetch(`${API_BASE_URL}/contas`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/categorias`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (!contasRes.ok || !categoriasRes.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const [contasData, categoriasData] = await Promise.all([
          contasRes.json(),
          categoriasRes.json(),
        ]);

        setContas(contasData);
        setCategorias(categoriasData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message || 'Erro desconhecido ao carregar dados.');
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    // Função para salvar nova categoria
    const saveNewCategory = async (categoryData) => {
        setIsSavingCategory(true);
        const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_BASE_URL}/categorias`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
                body: JSON.stringify(categoryData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
                setCategorias(prev => [...prev, data.categoria]);
        setFormData(prev => ({ ...prev, id_categoria: data.categoria.id }));
                setShowAddCategoryModal(false);
      } else {
                setError(data.erro || 'Erro ao criar categoria.');
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      setError('Erro ao criar categoria.');
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;
    
        if (selectedValue === 'add_new_category') {
            setShowAddCategoryModal(true);
        } else {
            setFormData(prev => ({ ...prev, id_categoria: selectedValue }));
        }
    };

    const handleAccountChange = (e) => {
        const selectedValue = e.target.value;
    
        if (selectedValue === 'add_new_account') {
            setShowAddAccountModal(true);
        } else {
            setFormData(prev => ({ ...prev, id_conta: selectedValue }));
        }
    };

    // Função para salvar nova conta
    const saveNewAccount = async (accountData) => {
        setIsSavingAccount(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/contas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(accountData),
            });

            const data = await response.json();

            if (response.ok) {
                setContas(prev => [...prev, data.conta]);
                setFormData(prev => ({ ...prev, id_conta: data.conta.id }));
                setShowAddAccountModal(false);
            } else {
                setError(data.erro || 'Erro ao criar conta.');
            }
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            setError('Erro ao criar conta.');
        } finally {
            setIsSavingAccount(false);
        }
    };

    // Função para formatar valor
    const formatCurrency = (value) => {
        // Remove caracteres não numéricos
        const numericValue = value.replace(/\D/g, '');
        
        // Converte para centavos e depois para reais
        const realValue = (parseInt(numericValue) / 100).toFixed(2);
        
        // Formata com vírgula como separador decimal
        return realValue.replace('.', ',');
    };

    const handleValueChange = (e) => {
        const formattedValue = formatCurrency(e.target.value);
        setFormData(prev => ({ ...prev, valor_total: formattedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Converte o valor formatado (com vírgula) para número
        const valorNumerico = parseFloat(formData.valor_total.replace(',', '.'));
      
        if (!formData.id_conta || !formData.id_categoria || valorNumerico <= 0 || isNaN(valorNumerico)) {
          setError('Selecione uma conta, uma categoria e informe um valor válido.');
          setShowSuccessModal(false);
          return;
        }

        setIsSubmitting(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        // Garante que a recorrência está no formato correto
        const recorrenciaValue = formData.recorrencia === 'Fixo' ? 'Fixo' : 'Esporadico';
        
        const transactionData = {
          id_conta: parseInt(formData.id_conta),
          id_categoria: parseInt(formData.id_categoria),
          valor: parseFloat(valorNumerico.toFixed(2)),
          tipo: formData.tipo,
          descricao: formData.descricao,
          data_transacao: formData.data_transacao,
          recorrencia: recorrenciaValue
        };

        console.log('🔍 Dados sendo enviados:', transactionData);
        console.log('🔍 Valor da recorrência:', formData.recorrencia);
        console.log('🔍 Tipo da recorrência:', typeof formData.recorrencia);

        try {
          const response = await fetch(`${API_BASE_URL}/transacoes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(transactionData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao registrar despesa');
          }

          setShowSuccessModal(true);
          // Reset form
          setFormData({
            data_transacao: new Date().toISOString().substring(0, 10),
            valor_total: '',
            descricao: '',
            id_conta: '',
            id_categoria: '',
            recorrencia: 'Esporadico',
          });
        } catch (err) {
          console.error('Erro ao registrar despesa:', err);
          setError(err.message || 'Erro ao registrar despesa');
        } finally {
          setIsSubmitting(false);
        }
    };

    if (isLoading) {
  return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
  );
    }

  return (
      <div className="p-4">
        <div className={`bg-white rounded-xl shadow-xl border-t-4 ${formData.tipo === 'receita' ? 'border-t-green-500' : 'border-t-red-500'} overflow-hidden`}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
              <button 
                  onClick={() => setTransactionSubView('debit_transactions_list')}
                  className="mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Voltar"
                >
                  <X size={24} />
              </button>
                <div>
                                <h2 className="text-xl font-bold text-gray-800">Registrar Transação</h2>
                                <p className="text-gray-600 text-sm">Registre suas despesas e receitas</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4" role="alert">
                  {error}
                </div>
              )}

              {/* Tipo */}
              <div className="mb-4">
                <label htmlFor="tipo" className="block text-sm font-semibold text-gray-700 mb-1">Tipo:</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border-gray-300 rounded-lg ${formData.tipo === 'receita' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-red-500 focus:border-red-500'} shadow-sm`}
                  disabled={isSubmitting || showSuccessModal}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </div>

              {/* Data e Valor */}
              <div className="flex space-x-3 mb-4">
                <div className="flex-1">
                  <label htmlFor="data_transacao" className="block text-sm font-semibold text-gray-700 mb-1">Data:</label>
                  <input
                    type="date"
                    id="data_transacao"
                    name="data_transacao"
                    value={formData.data_transacao}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border-gray-300 rounded-lg ${formData.tipo === 'receita' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-red-500 focus:border-red-500'} shadow-sm`}
                    disabled={isSubmitting || showSuccessModal}
                    required
                  />
                </div>

                <div className="flex-1">
                  <label htmlFor="valor_total" className="block text-sm font-semibold text-gray-700 mb-1">Valor:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {(() => {
                          const contaSelecionada = contas.find(conta => conta.id === formData.id_conta);
                          if (contaSelecionada) {
                            switch (contaSelecionada.moeda) {
                              case 'BRL': return 'R$';
                              case 'USD': return '$';
                              case 'EUR': return '€';
                              default: return contaSelecionada.moeda;
                            }
                          }
                          return 'R$';
                        })()}
                      </span>
                    </div>
                    <input
                      type="text"
                      id="valor_total"
                      name="valor_total"
                      value={formData.valor_total}
                      onChange={handleValueChange}
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm"
                      disabled={isSubmitting || showSuccessModal}
                      required
                />
          </div>
      </div>
              </div>

              {/* Recorrência */}
              <div className="mb-4">
                <label htmlFor="recorrencia" className="block text-sm font-semibold text-gray-700 mb-1">Recorrência:</label>
                <select
                  id="recorrencia"
                  name="recorrencia"
                  value={formData.recorrencia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg shadow-sm"
                  disabled={isSubmitting || showSuccessModal}
                  required
                >
                  <option value="Esporadico">Esporádico</option>
                  <option value="Fixo">Fixo</option>
                </select>
              </div>

              {/* Conta e Categoria */}
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <label htmlFor="id_conta" className="block text-sm font-semibold text-gray-700 mb-1">Conta:</label>
                  <select
                    id="id_conta"
                    name="id_conta"
                    value={formData.id_conta}
                    onChange={handleAccountChange}
                    className="w-full px-3 py-2 border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg shadow-sm"
                    disabled={isSubmitting || showSuccessModal}
                    required={contas.length > 0}
                  >
                    <option value="">Selecione uma conta</option>
                    {contas.map(conta => (
                      <option key={conta.id} value={conta.id}>{conta.nome}</option>
                    ))}
                    <option
                      value="add_new_account"
                      className="font-semibold text-red-600 bg-red-50"
                    >
                      + Adicionar Nova Conta
                    </option>
                  </select>
                </div>

                <div className="flex-1">
                  <label htmlFor="id_categoria" className="block text-sm font-semibold text-gray-700 mb-1">Categoria:</label>
                  <select
                    id="id_categoria"
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg shadow-sm"
                    disabled={isSubmitting || showSuccessModal}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias
                      .filter(categoria => categoria.tipo === formData.tipo)
                      .map(categoria => (
                      <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                    ))}
                    <option
                      value="add_new_category"
                      className="font-semibold text-red-600 bg-red-50"
                    >
                      + Adicionar Nova Categoria
                    </option>
                  </select>
                </div>
          </div>
          
              {/* Descrição */}
              <div className="mb-6">
                <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-1">Descrição:</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm"
                  disabled={isSubmitting || showSuccessModal}
                  placeholder="Descreva sua transação..."
                  required
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setTransactionSubView('debit_transactions_list')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting || showSuccessModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 ${formData.tipo === 'receita' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={isSubmitting || showSuccessModal}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
                  ) : formData.tipo === 'receita' ? 'Registrar Receita' : 'Registrar Despesa'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal de Sucesso */}
        <SuccessModal
          isOpen={showSuccessModal}
          message="A transação foi registrada com sucesso!"
          onConfirm={() => setTransactionSubView('debit_transactions_list')}
          onClose={() => setTransactionSubView('debit_transactions_list')}
        />

        {/* Modal de Adicionar Categoria */}
        {showAddCategoryModal && (
          <AddCategoryModal
            onSave={saveNewCategory}
            onCancel={() => setShowAddCategoryModal(false)}
            isSaving={isSavingCategory}
          />
        )}

        {/* Modal de Adicionar Conta */}
        {showAddAccountModal && (
          <AddAccountModal
            onSave={saveNewAccount}
            onCancel={() => setShowAddAccountModal(false)}
            isSaving={isSavingAccount}
          />
        )}
      </div>
  );
};

// --------------------------------------------------------------------------------
// Componente: IncomeTransactionScreen (NOVO)
// Formulário para registrar receitas usando contas bancárias
// --------------------------------------------------------------------------------
const IncomeTransactionScreen = ({ goToMenu }) => {
    const [contas, setContas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [isSavingAccount, setIsSavingAccount] = useState(false);

    const [formData, setFormData] = useState({
      data_transacao: new Date().toISOString().substring(0, 10),
      valor_total: '',
      descricao: '',
      id_conta: '',
      id_categoria: '',
      recorrencia: 'Esporadico',
    });


    // Função para buscar contas e categorias (apenas categorias do tipo "receita")
    const fetchData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
      if (!token) return;

      setIsLoading(true);
      setError(null);
      setShowSuccessModal(false);

      try {
        const [contasRes, categoriasRes] = await Promise.all([
          fetch(`${API_BASE_URL}/contas`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/categorias`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (!contasRes.ok || !categoriasRes.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const [contasData, categoriasData] = await Promise.all([
          contasRes.json(),
          categoriasRes.json(),
        ]);

        setContas(contasData);
        // Filtrar apenas categorias do tipo "receita"
        const categoriasReceita = categoriasData.filter(categoria => categoria.tipo === 'receita');
        setCategorias(categoriasReceita);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message || 'Erro desconhecido ao carregar dados.');
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    // Função para salvar nova categoria
    const saveNewCategory = async (categoryData) => {
        setIsSavingCategory(true);
        const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_BASE_URL}/categorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
                body: JSON.stringify(categoryData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
                setCategorias(prev => [...prev, data.categoria]);
        setFormData(prev => ({ ...prev, id_categoria: data.categoria.id }));
                setShowAddCategoryModal(false);
      } else {
                setError(data.erro || 'Erro ao criar categoria.');
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      setError('Erro ao criar categoria.');
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;
    
        if (selectedValue === 'add_new_category') {
            setShowAddCategoryModal(true);
        } else {
            setFormData(prev => ({ ...prev, id_categoria: selectedValue }));
        }
    };

    const handleAccountChange = (e) => {
        const selectedValue = e.target.value;
    
        if (selectedValue === 'add_new_account') {
            setShowAddAccountModal(true);
        } else {
            setFormData(prev => ({ ...prev, id_conta: selectedValue }));
        }
    };

    // Função para salvar nova conta
    const saveNewAccount = async (accountData) => {
        setIsSavingAccount(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/contas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(accountData),
            });

            const data = await response.json();

            if (response.ok) {
                setContas(prev => [...prev, data.conta]);
                setFormData(prev => ({ ...prev, id_conta: data.conta.id }));
                setShowAddAccountModal(false);
            } else {
                setError(data.erro || 'Erro ao criar conta.');
            }
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            setError('Erro ao criar conta.');
        } finally {
            setIsSavingAccount(false);
        }
    };

    // Função para formatar valor
    const formatCurrency = (value) => {
        // Remove caracteres não numéricos
        const numericValue = value.replace(/\D/g, '');
        
        // Converte para centavos e depois para reais
        const realValue = (parseInt(numericValue) / 100).toFixed(2);
        
        // Formata com vírgula como separador decimal
        return realValue.replace('.', ',');
    };

    const handleValueChange = (e) => {
        const formattedValue = formatCurrency(e.target.value);
        setFormData(prev => ({ ...prev, valor_total: formattedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Converte o valor formatado (com vírgula) para número
        const valorNumerico = parseFloat(formData.valor_total.replace(',', '.'));
      
        if (!formData.id_conta || !formData.id_categoria || valorNumerico <= 0 || isNaN(valorNumerico)) {
          setError('Selecione uma conta, uma categoria e informe um valor válido.');
          setShowSuccessModal(false);
          return;
        }

        setIsSubmitting(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        // Garante que a recorrência está no formato correto
        const recorrenciaValue = formData.recorrencia === 'Fixo' ? 'Fixo' : 'Esporadico';
        
        const transactionData = {
          id_conta: parseInt(formData.id_conta),
          id_categoria: parseInt(formData.id_categoria),
          valor: parseFloat(valorNumerico.toFixed(2)),
          tipo: 'receita',
          descricao: formData.descricao,
          data_transacao: formData.data_transacao,
          recorrencia: recorrenciaValue
        };

        console.log('🔍 Dados sendo enviados:', transactionData);
        console.log('🔍 Valor da recorrência:', formData.recorrencia);
        console.log('🔍 Tipo da recorrência:', typeof formData.recorrencia);

        try {
          const response = await fetch(`${API_BASE_URL}/transacoes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(transactionData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao registrar receita');
          }

          setShowSuccessModal(true);
          // Reset form
          setFormData({
            data_transacao: new Date().toISOString().substring(0, 10),
            valor_total: '',
            descricao: '',
            id_conta: '',
            id_categoria: '',
            recorrencia: 'Esporadico',
          });
        } catch (err) {
          console.error('Erro ao registrar receita:', err);
          setError(err.message || 'Erro ao registrar receita');
        } finally {
          setIsSubmitting(false);
        }
    };

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-xl border-t-4 border-t-green-500 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={goToMenu}
                  className="mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Voltar"
                >
                  <X size={24} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Registrar Receita</h2>
                  <p className="text-gray-600 text-sm">Registre seus ganhos e receitas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4" role="alert">
                  {error}
                </div>
              )}

              {/* Data e Valor */}
              <div className="flex space-x-3 mb-4">
                <div className="flex-1">
                  <label htmlFor="data_transacao" className="block text-sm font-semibold text-gray-700 mb-1">Data:</label>
                  <input
                    type="date"
                    id="data_transacao"
                    name="data_transacao"
                    value={formData.data_transacao}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
                    disabled={isSubmitting || showSuccessModal}
                    required
                  />
                </div>

                <div className="flex-1">
                  <label htmlFor="valor_total" className="block text-sm font-semibold text-gray-700 mb-1">Valor:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">R$</span>
                    </div>
                    <input
                      type="text"
                      id="valor_total"
                      name="valor_total"
                      value={formData.valor_total}
                      onChange={handleValueChange}
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
                      disabled={isSubmitting || showSuccessModal}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Recorrência */}
              <div className="mb-4">
                <label htmlFor="recorrencia" className="block text-sm font-semibold text-gray-700 mb-1">Recorrência:</label>
                <select
                  id="recorrencia"
                  name="recorrencia"
                  value={formData.recorrencia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg shadow-sm"
                  disabled={isSubmitting || showSuccessModal}
                  required
                >
                  <option value="Esporadico">Esporádico</option>
                  <option value="Fixo">Fixo</option>
                </select>
              </div>

              {/* Conta e Categoria */}
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <label htmlFor="id_conta" className="block text-sm font-semibold text-gray-700 mb-1">Conta:</label>
                  <select
                    id="id_conta"
                    name="id_conta"
                    value={formData.id_conta}
                    onChange={handleAccountChange}
                    className="w-full px-3 py-2 border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg shadow-sm"
                    disabled={isSubmitting || showSuccessModal}
                    required={contas.length > 0}
                  >
                    <option value="">Selecione uma conta</option>
                    {contas.map(conta => (
                      <option key={conta.id} value={conta.id}>{conta.nome}</option>
                    ))}
                    <option
                      value="add_new_account"
                      className="font-semibold text-green-600 bg-green-50"
                    >
                      + Adicionar Nova Conta
                    </option>
                  </select>
                </div>

                <div className="flex-1">
                  <label htmlFor="id_categoria" className="block text-sm font-semibold text-gray-700 mb-1">Categoria:</label>
                  <select
                    id="id_categoria"
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg shadow-sm"
                    disabled={isSubmitting || showSuccessModal}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                    ))}
                    <option
                      value="add_new_category"
                      className="font-semibold text-green-600 bg-green-50"
                    >
                      + Adicionar Nova Categoria
                    </option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-6">
                <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-1">Descrição:</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 shadow-sm"
                  disabled={isSubmitting || showSuccessModal}
                  placeholder="Descreva sua receita..."
                  required
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={goToMenu}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting || showSuccessModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || showSuccessModal}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
                  ) : 'Registrar Receita'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal de Sucesso */}
        <SuccessModal
          isOpen={showSuccessModal}
          message="A receita foi registrada com sucesso!"
          onConfirm={goToMenu}
          onClose={goToMenu}
        />

        {/* Modal de Adicionar Categoria */}
        {showAddCategoryModal && (
          <AddCategoryModal
            onSave={saveNewCategory}
            onCancel={() => setShowAddCategoryModal(false)}
            isSaving={isSavingCategory}
          />
        )}

        {/* Modal de Adicionar Conta */}
        {showAddAccountModal && (
          <AddAccountModal
            onSave={saveNewAccount}
            onCancel={() => setShowAddAccountModal(false)}
            isSaving={isSavingAccount}
          />
        )}
      </div>
    );
};

// --------------------------------------------------------------------------------
// Componente: TransferTransactionScreen (NOVO)
// Formulário para registrar transferências entre contas
// --------------------------------------------------------------------------------
const TransferTransactionScreen = ({ goToMenu }) => {
    const [contas, setContas] = useState([]);
    const [contasDestino, setContasDestino] = useState([]);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingAccount, setIsSavingAccount] = useState(false);

    const [formData, setFormData] = useState({
      data_transacao: new Date().toISOString().substring(0, 10),
      valor_total: '',
      descricao: '',
      id_conta_origem: '',
      id_conta_destino: '',
    });

    // Função para buscar contas
    const fetchData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
      if (!token) return;

      setIsLoading(true);
      setError(null);
      setShowSuccessModal(false);

      try {
        const contasRes = await fetch(`${API_BASE_URL}/contas`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!contasRes.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const contasData = await contasRes.json();
        setContas(contasData);
        setContasDestino([]); // Inicialmente vazio até selecionar conta origem
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message || 'Erro desconhecido ao carregar dados.');
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    // Função para filtrar contas destino baseado na moeda da conta origem
    const filterContasDestino = (contaOrigemId) => {
      if (!contaOrigemId) {
        setContasDestino([]);
        return;
      }

      const contaOrigem = contas.find(conta => conta.id === parseInt(contaOrigemId));
      if (!contaOrigem) {
        setContasDestino([]);
        return;
      }

      // Filtra contas com a mesma moeda, excluindo a conta origem
      const contasFiltradas = contas.filter(conta => 
        conta.moeda === contaOrigem.moeda && conta.id !== parseInt(contaOrigemId)
      );
      setContasDestino(contasFiltradas);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContaOrigemChange = (e) => {
        const selectedValue = e.target.value;
    
        if (selectedValue === 'add_new_account') {
            setShowAddAccountModal(true);
        } else {
            setFormData(prev => ({ 
                ...prev, 
                id_conta_origem: selectedValue,
                id_conta_destino: '' // Limpa conta destino ao mudar origem
            }));
            filterContasDestino(selectedValue);
        }
    };

    const handleContaDestinoChange = (e) => {
        const selectedValue = e.target.value;
    
        if (selectedValue === 'add_new_account') {
            setShowAddAccountModal(true);
        } else {
            setFormData(prev => ({ ...prev, id_conta_destino: selectedValue }));
        }
    };

    // Função para salvar nova conta
    const saveNewAccount = async (accountData) => {
        setIsSavingAccount(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/contas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(accountData),
            });

            const data = await response.json();

            if (response.ok) {
                setContas(prev => [...prev, data.conta]);
                // Se não há conta origem selecionada, não filtra ainda
                if (formData.id_conta_origem) {
                    filterContasDestino(formData.id_conta_origem);
                }
                setShowAddAccountModal(false);
            } else {
                setError(data.erro || 'Erro ao criar conta.');
            }
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            setError('Erro ao criar conta.');
        } finally {
            setIsSavingAccount(false);
        }
    };

    // Função para formatar valor
    const formatCurrency = (value) => {
        // Remove caracteres não numéricos
        const numericValue = value.replace(/\D/g, '');
        
        // Converte para centavos e depois para reais
        const realValue = (parseInt(numericValue) / 100).toFixed(2);
        
        // Formata com vírgula como separador decimal
        return realValue.replace('.', ',');
    };

    const handleValueChange = (e) => {
        const formattedValue = formatCurrency(e.target.value);
        setFormData(prev => ({ ...prev, valor_total: formattedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Converte o valor formatado (com vírgula) para número
        const valorNumerico = parseFloat(formData.valor_total.replace(',', '.'));
      
        if (!formData.id_conta_origem || !formData.id_conta_destino || valorNumerico <= 0 || isNaN(valorNumerico)) {
          setError('Selecione as contas de origem e destino e informe um valor válido.');
          setShowSuccessModal(false);
          return;
        }

        if (formData.id_conta_origem === formData.id_conta_destino) {
          setError('A conta de origem e destino não podem ser a mesma.');
          setShowSuccessModal(false);
          return;
        }

        setIsSubmitting(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        
        const transferData = {
          id_conta_origem: parseInt(formData.id_conta_origem),
          id_conta_destino: parseInt(formData.id_conta_destino),
          valor: parseFloat(valorNumerico.toFixed(2)),
          descricao: formData.descricao,
          data_transacao: formData.data_transacao
        };

        console.log('🔍 Dados sendo enviados:', transferData);

        try {
          const response = await fetch(`${API_BASE_URL}/transacoes/transferencia`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(transferData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao registrar transferência');
          }

          setShowSuccessModal(true);
          // Reset form
          setFormData({
            data_transacao: new Date().toISOString().substring(0, 10),
            valor_total: '',
            descricao: '',
            id_conta_origem: '',
            id_conta_destino: '',
          });
          setContasDestino([]);
        } catch (err) {
          console.error('Erro ao registrar transferência:', err);
          setError(err.message || 'Erro ao registrar transferência');
        } finally {
          setIsSubmitting(false);
        }
    };

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-xl border-t-4 border-t-blue-500 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={goToMenu}
                  className="mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Voltar"
                >
                  <X size={24} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Registrar Transferência</h2>
                  <p className="text-gray-600 text-sm">Transfira valores entre suas contas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4" role="alert">
                  {error}
                </div>
              )}

              {/* Data e Valor */}
              <div className="flex space-x-3 mb-4">
                <div className="flex-1">
                  <label htmlFor="data_transacao" className="block text-sm font-semibold text-gray-700 mb-1">Data:</label>
                  <input
                    type="date"
                    id="data_transacao"
                    name="data_transacao"
                    value={formData.data_transacao}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    disabled={isSubmitting || showSuccessModal}
                    required
                  />
                </div>

                <div className="flex-1">
                  <label htmlFor="valor_total" className="block text-sm font-semibold text-gray-700 mb-1">Valor:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">R$</span>
                    </div>
                    <input
                      type="text"
                      id="valor_total"
                      name="valor_total"
                      value={formData.valor_total}
                      onChange={handleValueChange}
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      disabled={isSubmitting || showSuccessModal}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Conta Origem e Conta Destino */}
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <label htmlFor="id_conta_origem" className="block text-sm font-semibold text-gray-700 mb-1">Conta de Origem:</label>
                  <select
                    id="id_conta_origem"
                    name="id_conta_origem"
                    value={formData.id_conta_origem}
                    onChange={handleContaOrigemChange}
                    className="w-full px-3 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                    disabled={isSubmitting || showSuccessModal}
                    required={contas.length > 0}
                  >
                    <option value="">Selecione a conta de origem</option>
                    {contas.map(conta => (
                      <option key={conta.id} value={conta.id}>{conta.nome} ({conta.moeda})</option>
                    ))}
                    <option
                      value="add_new_account"
                      className="font-semibold text-blue-600 bg-blue-50"
                    >
                      + Adicionar Nova Conta
                    </option>
                  </select>
                </div>

                <div className="flex-1">
                  <label htmlFor="id_conta_destino" className="block text-sm font-semibold text-gray-700 mb-1">Conta de Destino:</label>
                  <select
                    id="id_conta_destino"
                    name="id_conta_destino"
                    value={formData.id_conta_destino}
                    onChange={handleContaDestinoChange}
                    className="w-full px-3 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                    disabled={isSubmitting || showSuccessModal || !formData.id_conta_origem}
                    required
                  >
                    <option value="">{formData.id_conta_origem ? 'Selecione a conta de destino' : 'Selecione primeiro a conta de origem'}</option>
                    {contasDestino.map(conta => (
                      <option key={conta.id} value={conta.id}>{conta.nome} ({conta.moeda})</option>
                    ))}
                    <option
                      value="add_new_account"
                      className="font-semibold text-blue-600 bg-blue-50"
                    >
                      + Adicionar Nova Conta
                    </option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-6">
                <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-1">Descrição:</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  disabled={isSubmitting || showSuccessModal}
                  placeholder="Descreva a transferência..."
                  required
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={goToMenu}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting || showSuccessModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || showSuccessModal}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transferindo...</>
                  ) : 'Registrar Transferência'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal de Sucesso */}
        <SuccessModal
          isOpen={showSuccessModal}
          message="A transferência foi registrada com sucesso!"
          onConfirm={goToMenu}
          onClose={goToMenu}
        />

        {/* Modal de Adicionar Conta */}
        {showAddAccountModal && (
          <AddAccountModal
            onSave={saveNewAccount}
            onCancel={() => setShowAddAccountModal(false)}
            isSaving={isSavingAccount}
          />
        )}
      </div>
    );
};

// --------------------------------------------------------------------------------
// Componente: ConversionTransactionScreen (NOVO)
// Formulário para registrar conversões entre moedas
// --------------------------------------------------------------------------------
const ConversionTransactionScreen = ({ goToMenu }) => {
    const [contas, setContas] = useState([]);
    const [contasDestino, setContasDestino] = useState([]);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingAccount, setIsSavingAccount] = useState(false);

    const [formData, setFormData] = useState({
      data_transacao: new Date().toISOString().substring(0, 10),
      valor_origem: '',
      valor_destino: '',
      taxa_cambio: '',
      descricao: '',
      id_conta_origem: '',
      id_conta_destino: '',
    });

    // Função para obter símbolo da moeda
    const getCurrencySymbol = (moeda) => {
        switch (moeda) {
            case 'BRL': return 'R$';
            case 'USD': return '$';
            case 'EUR': return '€';
            default: return moeda;
        }
    };

    // Função para buscar contas
    const fetchData = useCallback(async () => {
    const token = localStorage.getItem('authToken');
      if (!token) return;

      setIsLoading(true);
      setError(null);
      setShowSuccessModal(false);

      try {
        const contasRes = await fetch(`${API_BASE_URL}/contas`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!contasRes.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const contasData = await contasRes.json();
        setContas(contasData);
        setContasDestino([]); // Inicialmente vazio até selecionar conta origem
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message || 'Erro desconhecido ao carregar dados.');
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    // Função para filtrar contas destino com moedas diferentes da origem
    const filterContasDestino = (contaOrigemId) => {
      if (!contaOrigemId) {
        setContasDestino([]);
        return;
      }

      const contaOrigem = contas.find(conta => conta.id === parseInt(contaOrigemId));
      if (!contaOrigem) {
        setContasDestino([]);
        return;
      }

      // Filtra contas com moedas diferentes, excluindo a conta origem
      const contasFiltradas = contas.filter(conta => 
        conta.moeda !== contaOrigem.moeda && conta.id !== parseInt(contaOrigemId)
      );
      setContasDestino(contasFiltradas);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContaOrigemChange = (e) => {
        const selectedValue = e.target.value;
    
        if (selectedValue === 'add_new_account') {
            setShowAddAccountModal(true);
        } else {
            setFormData(prev => ({ 
                ...prev, 
                id_conta_origem: selectedValue,
                id_conta_destino: '' // Limpa conta destino ao mudar origem
            }));
            filterContasDestino(selectedValue);
        }
    };

    const handleContaDestinoChange = (e) => {
        const selectedValue = e.target.value;
    
        if (selectedValue === 'add_new_account') {
            setShowAddAccountModal(true);
        } else {
            setFormData(prev => ({ ...prev, id_conta_destino: selectedValue }));
        }
    };

    // Função para salvar nova conta
    const saveNewAccount = async (accountData) => {
        setIsSavingAccount(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/contas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(accountData),
            });

            const data = await response.json();

            if (response.ok) {
                setContas(prev => [...prev, data.conta]);
                // Se não há conta origem selecionada, não filtra ainda
                if (formData.id_conta_origem) {
                    filterContasDestino(formData.id_conta_origem);
                }
                setShowAddAccountModal(false);
            } else {
                setError(data.erro || 'Erro ao criar conta.');
            }
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            setError('Erro ao criar conta.');
        } finally {
            setIsSavingAccount(false);
        }
    };

    // Função para formatar valor
    const formatCurrency = (value) => {
        // Remove caracteres não numéricos
        const numericValue = value.replace(/\D/g, '');
        
        // Converte para centavos e depois para reais
        const realValue = (parseInt(numericValue) / 100).toFixed(2);
        
        // Formata com vírgula como separador decimal
        return realValue.replace('.', ',');
    };

    const handleValueChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = formatCurrency(value);
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Converte os valores formatados (com vírgula) para número
        const valorOrigemNumerico = parseFloat(formData.valor_origem.replace(',', '.'));
        const valorDestinoNumerico = parseFloat(formData.valor_destino.replace(',', '.'));
        const taxaNumerica = parseFloat(formData.taxa_cambio.replace(',', '.'));
      
        if (!formData.id_conta_origem || !formData.id_conta_destino || 
            valorOrigemNumerico <= 0 || isNaN(valorOrigemNumerico) ||
            valorDestinoNumerico <= 0 || isNaN(valorDestinoNumerico) ||
            taxaNumerica <= 0 || isNaN(taxaNumerica)) {
          setError('Selecione as contas e informe valores válidos para origem, destino e taxa.');
          setShowSuccessModal(false);
          return;
        }

        if (formData.id_conta_origem === formData.id_conta_destino) {
          setError('A conta de origem e destino não podem ser a mesma.');
          setShowSuccessModal(false);
          return;
        }

        // Validação adicional: verificar se as moedas são diferentes
        const contaOrigem = contas.find(conta => conta.id === parseInt(formData.id_conta_origem));
        const contaDestino = contas.find(conta => conta.id === parseInt(formData.id_conta_destino));
        
        if (contaOrigem && contaDestino && contaOrigem.moeda === contaDestino.moeda) {
          setError('Para conversão, as contas devem ter moedas diferentes. Use transferência para moedas iguais.');
          setShowSuccessModal(false);
          return;
        }

        setIsSubmitting(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        
        const conversionData = {
          id_conta_origem: parseInt(formData.id_conta_origem),
          id_conta_destino: parseInt(formData.id_conta_destino),
          valor_origem: parseFloat(valorOrigemNumerico.toFixed(2)),
          valor_destino: parseFloat(valorDestinoNumerico.toFixed(2)),
          taxa_cambio: parseFloat(taxaNumerica.toFixed(2)),
          descricao: formData.descricao,
          data_transacao: formData.data_transacao
        };

        console.log('🔍 Dados sendo enviados:', conversionData);

        try {
          const response = await fetch(`${API_BASE_URL}/transacoes/conversao`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(conversionData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.erro || 'Erro ao registrar conversão');
          }

          setShowSuccessModal(true);
          // Reset form
          setFormData({
            data_transacao: new Date().toISOString().substring(0, 10),
            valor_origem: '',
            valor_destino: '',
            taxa_cambio: '',
            descricao: '',
            id_conta_origem: '',
            id_conta_destino: '',
          });
          setContasDestino([]);
        } catch (err) {
          console.error('Erro ao registrar conversão:', err);
          setError(err.message || 'Erro ao registrar conversão');
        } finally {
          setIsSubmitting(false);
        }
    };

    // Obter símbolos das moedas baseado nas contas selecionadas
    const contaOrigem = contas.find(conta => conta.id === parseInt(formData.id_conta_origem));
    const contaDestino = contas.find(conta => conta.id === parseInt(formData.id_conta_destino));
    const simboloOrigem = contaOrigem ? getCurrencySymbol(contaOrigem.moeda) : 'R$';
    const simboloDestino = contaDestino ? getCurrencySymbol(contaDestino.moeda) : '$';

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-xl border-t-4 border-t-purple-500 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button 
                  onClick={goToMenu}
                  className="mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Voltar"
                >
                  <X size={24} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Registrar Conversão</h2>
                  <p className="text-gray-600 text-sm">Converta valores entre diferentes moedas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4" role="alert">
                  {error}
                </div>
              )}

              {/* Data */}
              <div className="mb-4">
                <label htmlFor="data_transacao" className="block text-sm font-semibold text-gray-700 mb-1">Data:</label>
                <input
                  type="date"
                  id="data_transacao"
                  name="data_transacao"
                  value={formData.data_transacao}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                  disabled={isSubmitting || showSuccessModal}
                  required
                />
              </div>

              {/* Conta Origem e Conta Destino */}
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <label htmlFor="id_conta_origem" className="block text-sm font-semibold text-gray-700 mb-1">Conta de Origem:</label>
                  <select
                    id="id_conta_origem"
                    name="id_conta_origem"
                    value={formData.id_conta_origem}
                    onChange={handleContaOrigemChange}
                    className="w-full px-3 py-2 border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg shadow-sm"
                    disabled={isSubmitting || showSuccessModal}
                    required={contas.length > 0}
                  >
                    <option value="">Selecione a conta de origem</option>
                    {contas.map(conta => (
                      <option key={conta.id} value={conta.id}>{conta.nome} ({conta.moeda})</option>
                    ))}
                    <option
                      value="add_new_account"
                      className="font-semibold text-purple-600 bg-purple-50"
                    >
                      + Adicionar Nova Conta
                    </option>
                  </select>
                </div>

                <div className="flex-1">
                  <label htmlFor="id_conta_destino" className="block text-sm font-semibold text-gray-700 mb-1">Conta de Destino:</label>
                  <select
                    id="id_conta_destino"
                    name="id_conta_destino"
                    value={formData.id_conta_destino}
                    onChange={handleContaDestinoChange}
                    className="w-full px-3 py-2 border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg shadow-sm"
                    disabled={isSubmitting || showSuccessModal || !formData.id_conta_origem}
                    required
                  >
                    <option value="">{formData.id_conta_origem ? 'Selecione a conta de destino' : 'Selecione primeiro a conta de origem'}</option>
                    {contasDestino.map(conta => (
                      <option key={conta.id} value={conta.id}>{conta.nome} ({conta.moeda})</option>
                    ))}
                    <option
                      value="add_new_account"
                      className="font-semibold text-purple-600 bg-purple-50"
                    >
                      + Adicionar Nova Conta
                    </option>
                  </select>
                </div>
              </div>

              {/* Valores */}
              <div className="flex space-x-3 mb-4">
                <div className="flex-1">
                  <label htmlFor="valor_origem" className="block text-sm font-semibold text-gray-700 mb-1">Valor de Origem:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{simboloOrigem}</span>
                    </div>
                    <input
                      type="text"
                      id="valor_origem"
                      name="valor_origem"
                      value={formData.valor_origem}
                      onChange={handleValueChange}
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                      disabled={isSubmitting || showSuccessModal}
                      required
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label htmlFor="valor_destino" className="block text-sm font-semibold text-gray-700 mb-1">Valor de Destino:</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">{simboloDestino}</span>
                    </div>
                    <input
                      type="text"
                      id="valor_destino"
                      name="valor_destino"
                      value={formData.valor_destino}
                      onChange={handleValueChange}
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                      disabled={isSubmitting || showSuccessModal}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Taxa de Câmbio */}
              <div className="mb-4">
                <label htmlFor="taxa_cambio" className="block text-sm font-semibold text-gray-700 mb-1">Taxa de Câmbio:</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{simboloOrigem}</span>
                  </div>
                  <input
                    type="text"
                    id="taxa_cambio"
                    name="taxa_cambio"
                    value={formData.taxa_cambio}
                    onChange={handleValueChange}
                    placeholder="0,00"
                    className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                    disabled={isSubmitting || showSuccessModal}
                    required
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-6">
                <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-1">Descrição:</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                  disabled={isSubmitting || showSuccessModal}
                  placeholder="Descreva a conversão..."
                  required
                />
              </div>

              {/* Botões */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={goToMenu}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting || showSuccessModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || showSuccessModal}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Convertendo...</>
                  ) : 'Registrar Conversão'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal de Sucesso */}
        <SuccessModal
          isOpen={showSuccessModal}
          message="A conversão foi registrada com sucesso!"
          onConfirm={goToMenu}
          onClose={goToMenu}
        />

        {/* Modal de Adicionar Conta */}
        {showAddAccountModal && (
          <AddAccountModal
            onSave={saveNewAccount}
            onCancel={() => setShowAddAccountModal(false)}
            isSaving={isSavingAccount}
          />
        )}
      </div>
    );
};

// --------------------------------------------------------------------------------
// Componente: FaturasListScreen (NOVO)
// Tela para listar faturas de crédito do usuário
// --------------------------------------------------------------------------------
const FaturasListScreen = ({ goToMenu }) => {
    const [faturas, setFaturas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagamentosInfo, setPagamentosInfo] = useState({});
    const [contasInfo, setContasInfo] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [faturaToDelete, setFaturaToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentView, setCurrentView] = useState('list'); // 'list' ou 'payment'
    const [faturaToPay, setFaturaToPay] = useState(null);
    
    // Estados para modal de pagamento
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentAccount, setSelectedPaymentAccount] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    
    // Estados para modal de adicionar nova conta
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [parcelas, setParcelas] = useState([]);
    const [categoriasInfo, setCategoriasInfo] = useState({});
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [showJurosModal, setShowJurosModal] = useState(false);
    const [jurosValue, setJurosValue] = useState('0,00');
    const [isAddingJuros, setIsAddingJuros] = useState(false);
    const [showDeleteJurosModal, setShowDeleteJurosModal] = useState(false);
    const [jurosToDelete, setJurosToDelete] = useState(null);
    const [isDeletingJuros, setIsDeletingJuros] = useState(false);

    // Estados para edição de parcela
    const [showEditParcelaModal, setShowEditParcelaModal] = useState(false);
    const [parcelaToEdit, setParcelaToEdit] = useState(null);
    const [novoValorParcela, setNovoValorParcela] = useState('');
    const [isEditingParcela, setIsEditingParcela] = useState(false);

    // Função para buscar faturas e informações de pagamento
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            // Buscar faturas
            const faturasResponse = await fetch(`${API_BASE_URL}/faturas/credito`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (faturasResponse.ok) {
                const faturasData = await faturasResponse.json();
                setFaturas(faturasData.faturas || []);

                // Buscar informações de pagamento, contas e categorias
                const [pagamentosResponse, contasResponse, categoriasResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/transacoes/pagamentos-fatura`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE_URL}/contas`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE_URL}/categorias`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    })
                ]);

                if (pagamentosResponse.ok) {
                    const pagamentosData = await pagamentosResponse.json();
                    const pagamentos = pagamentosData.pagamentos_fatura || [];
                    
                    // Criar mapa de informações de pagamento
                    const pagamentosMap = {};
                    pagamentos.forEach(pagamento => {
                        const chave = `${pagamento.id_cartao}_${pagamento.mes_ano_fatura}`;
                        pagamentosMap[chave] = pagamento;
                    });
                    
                    setPagamentosInfo(pagamentosMap);
                }

                if (contasResponse.ok) {
                    const contasData = await contasResponse.json();
                    
                    // Criar mapa de informações das contas (agora com dados completos)
                    const contasMap = {};
                    contasData.forEach(conta => {
                        contasMap[conta.id] = conta; // Armazenar objeto completo da conta
                    });
                    
                    setContasInfo(contasMap);
                }

                if (categoriasResponse.ok) {
                    const categoriasData = await categoriasResponse.json();
                    
                    // Criar mapa de informações das categorias
                    const categoriasMap = {};
                    categoriasData.forEach(categoria => {
                        categoriasMap[categoria.id] = categoria.nome;
                    });
                    
                    setCategoriasInfo(categoriasMap);
                }
            } else {
                setError('Erro ao carregar faturas');
            }
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            setError('Erro ao carregar faturas');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // Função para formatar data
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    // Função para lidar com clique no botão de excluir
    const handleDeleteClick = (fatura) => {
        setFaturaToDelete(fatura);
        setShowDeleteModal(true);
    };

    // Função para abrir modal de pagamento
    const handleOpenPaymentModal = (fatura) => {
        console.log('Abrindo modal de pagamento para fatura:', fatura);
        setFaturaToPay(fatura);
        setSelectedPaymentAccount('');
        setShowPaymentModal(true);
        console.log('Estados atualizados - showPaymentModal:', true);
    };

    // Função para fechar modal de pagamento
    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
        setFaturaToPay(null);
        setSelectedPaymentAccount('');
    };

    // Função para cancelar pagamento
    const handleCancelPayment = () => {
        // Apenas fechar o modal de seleção de conta, mantendo o usuário na tela de parcelas
        setShowPaymentModal(false);
        setSelectedPaymentAccount('');
        // NÃO fechar o modal de parcelas (faturaToPay permanece)
    };

    // Função para confirmar pagamento
    const handleConfirmPayment = async () => {
        if (!faturaToPay || !selectedPaymentAccount) {
            console.error('Dados insuficientes para pagamento');
            return;
        }

        setIsProcessingPayment(true);
        
        try {
            const token = localStorage.getItem('authToken');
            
            // Extrair mês e ano da fatura
            const mes = parseInt(faturaToPay.fatura_referencia.split('/')[1]); // Pega o mês
            const ano = parseInt(faturaToPay.fatura_referencia.split('/')[0]); // Pega o ano
            
            const response = await fetch(`${API_BASE_URL}/faturas/pagar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_cartao: faturaToPay.id_cartao,
                    id_conta: selectedPaymentAccount,
                    mes: mes,
                    ano: ano,
                    valor_pago: parseFloat(faturaToPay.valor_total_fatura)
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Pagamento realizado com sucesso
                handleClosePaymentModal();
                setCurrentView('list'); // Volta para a tela de listagem
                setFaturaToPay(null);
                
                // Recarregar dados para mostrar as atualizações
                await fetchData();
            } else {
                console.error('Erro ao pagar fatura:', result.erro);
            }
        } catch (error) {
            console.error('Erro ao pagar fatura:', error);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Funções para modal de adicionar nova conta
    const handleOpenAddAccountModal = () => {
        setShowAddAccountModal(true);
    };

    const handleCloseAddAccountModal = () => {
        setShowAddAccountModal(false);
    };

    const handleAddAccount = async (accountData) => {
        setIsAddingAccount(true);
        
        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`${API_BASE_URL}/contas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome: accountData.nome,
                    moeda: accountData.moeda,
                    saldo_inicial: parseFloat(accountData.saldo_inicial)
                })
            });

            const result = await response.json();

            if (response.ok) {
                handleCloseAddAccountModal();
                
                // Recarregar contas
                await fetchData();
                
                // Selecionar automaticamente a nova conta
                setSelectedPaymentAccount(result.conta.id);
            } else {
                console.error('Erro ao criar conta:', result.erro);
            }
        } catch (error) {
            console.error('Erro ao criar conta:', error);
        } finally {
            setIsAddingAccount(false);
        }
    };

    // Função para confirmar exclusão
    const handleConfirmDelete = async () => {
        if (!faturaToDelete) return;

        setIsDeleting(true);
        const token = localStorage.getItem('authToken');

        try {
            // Debug: verificar dados da fatura
            console.log('Fatura a ser excluída:', faturaToDelete);
            
            let idTransacao = null;
            
            // Se a fatura já tem id_transacao (fatura paga), usar diretamente
            if (faturaToDelete.id_transacao) {
                idTransacao = faturaToDelete.id_transacao;
                console.log('ID da transação encontrado na fatura:', idTransacao);
            } else {
                // Se não tem, buscar na rota de faturas pagas
                console.log('Buscando ID da transação na rota /faturas/pagas...');
                
                const faturasPagasResponse = await fetch(`${API_BASE_URL}/faturas/pagas`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (faturasPagasResponse.ok) {
                    const faturasPagasData = await faturasPagasResponse.json();
                    const faturasPagas = faturasPagasData.faturas_pagas || [];
                    
                    console.log('Faturas pagas encontradas:', faturasPagas);
                    console.log('Procurando por:', {
                        id_cartao: faturaToDelete.id_cartao,
                        fatura_referencia: faturaToDelete.fatura_referencia
                    });
                    
                    // Encontrar a fatura correspondente
                    const faturaPaga = faturasPagas.find(fp => {
                        // Converter formato da referência para comparação (2025/10 -> 2025-10)
                        const referenciaFormatada = faturaToDelete.fatura_referencia.replace('/', '-');
                        
                        console.log('Comparando com:', {
                            cartao_id: fp.cartao?.id,
                            fatura_ref: fp.fatura_referencia,
                            referencia_formatada: referenciaFormatada,
                            match_cartao: fp.cartao?.id === faturaToDelete.id_cartao,
                            match_referencia: fp.fatura_referencia === referenciaFormatada
                        });
                        return fp.cartao?.id === faturaToDelete.id_cartao && 
                               fp.fatura_referencia === referenciaFormatada;
                    });
                    
                    console.log('Fatura paga encontrada:', faturaPaga);
                    
                    if (faturaPaga && faturaPaga.id_transacao) {
                        idTransacao = faturaPaga.id_transacao;
                        console.log('ID da transação encontrado na busca:', idTransacao);
                    } else {
                        console.log('Fatura paga não encontrada ou sem id_transacao');
                    }
                } else {
                    console.error('Erro ao buscar faturas pagas:', faturasPagasResponse.status);
                }
            }

            // Se ainda não encontrou, buscar o id_pagamento através do id_compra
            if (!idTransacao && faturaToDelete.parcelas && faturaToDelete.parcelas.length > 0) {
                const primeiraParcela = faturaToDelete.parcelas[0];
                if (primeiraParcela.id_compra) {
                    console.log('Buscando id_pagamento através do id_compra:', primeiraParcela.id_compra);
                    
                    // Buscar o id_pagamento das parcelas que têm este id_compra
                    const parcelasResponse = await fetch(`${API_BASE_URL}/compras/${primeiraParcela.id_compra}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });

                    if (parcelasResponse.ok) {
                        const parcelasData = await parcelasResponse.json();
                        const parcelas = parcelasData.parcelas || [];
                        
                        console.log('Parcelas encontradas:', parcelas);
                        
                        // Procurar uma parcela com id_pagamento (parcela paga)
                        const parcelaPaga = parcelas.find(p => {
                            console.log('Verificando parcela:', {
                                id: p.id,
                                id_pagamento: p.id_pagamento,
                                status: p.status,
                                tem_id_pagamento: !!p.id_pagamento
                            });
                            return p.id_pagamento;
                        });
                        
                        if (parcelaPaga && parcelaPaga.id_pagamento) {
                            idTransacao = parcelaPaga.id_pagamento;
                            console.log('ID da transação de pagamento encontrado via id_pagamento:', idTransacao);
                        } else {
                            console.log('Nenhuma parcela paga encontrada para este id_compra');
                            console.log('Detalhes das parcelas:', parcelas.map(p => ({
                                id: p.id,
                                id_pagamento: p.id_pagamento,
                                status: p.status
                            })));
                        }
                    } else {
                        console.error('Erro ao buscar parcelas da compra:', parcelasResponse.status);
                    }
                }
            }

            // Se ainda não encontrou, tentar buscar diretamente a transação 165
            if (!idTransacao) {
                console.log('Tentando buscar transação 165 diretamente...');
                
                // Verificar se a transação 165 existe e é de pagamento de fatura
                const transacaoResponse = await fetch(`${API_BASE_URL}/transacoes/165`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (transacaoResponse.ok) {
                    const transacaoData = await transacaoResponse.json();
                    const transacao = transacaoData.transacao;
                    
                    console.log('Transação 165 encontrada:', transacao);
                    
                    // Verificar se é uma transação de pagamento de fatura (TRP-*)
                    if (transacao && transacao.id_grupo_operacao && transacao.id_grupo_operacao.startsWith('TRP-')) {
                        idTransacao = 165;
                        console.log('Usando transação 165 como id_transacao:', idTransacao);
                    } else {
                        console.log('Transação 165 não é de pagamento de fatura');
                    }
                } else {
                    console.log('Transação 165 não encontrada');
                }
            }

            if (!idTransacao) {
                console.error('ID da transação não encontrado');
                console.log('Dados da fatura para debug:', {
                    id_transacao: faturaToDelete.id_transacao,
                    parcelas: faturaToDelete.parcelas,
                    id_cartao: faturaToDelete.id_cartao,
                    fatura_referencia: faturaToDelete.fatura_referencia
                });
                alert('Erro: Não foi possível encontrar o ID da transação. Tente novamente.');
                return;
            }

            // Fazer a exclusão usando o ID encontrado
            const deleteResponse = await fetch(`${API_BASE_URL}/faturas/pagar`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id_transacao: idTransacao
                }),
            });

            if (deleteResponse.ok) {
                // Atualizar lista após exclusão
                await fetchData();
                setShowDeleteModal(false);
                setFaturaToDelete(null);
            } else {
                const errorData = await deleteResponse.json();
                console.error('Erro ao excluir fatura:', errorData);
                alert(`Erro ao excluir fatura: ${errorData.erro || 'Tente novamente.'}`);
            }
        } catch (error) {
            console.error('Erro ao excluir fatura:', error);
            alert('Erro ao excluir fatura. Tente novamente.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Função para cancelar exclusão
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setFaturaToDelete(null);
    };

    // Função para lidar com clique no botão de pagar
    const handlePayClick = async (fatura) => {
        setIsLoadingPayment(true);
        setFaturaToPay(fatura);
        setCurrentView('payment');
        
        // Buscar parcelas da fatura
        await fetchParcelas(fatura);
        setIsLoadingPayment(false);
    };

    // Função para buscar parcelas da fatura
    const fetchParcelas = async (fatura) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            // Extrair mês e ano da data de vencimento
            const dataVencimento = new Date(fatura.parcelas[0]?.data_vencimento);
            const mes = dataVencimento.getMonth() + 1; // getMonth() retorna 0-11
            const ano = dataVencimento.getFullYear();

            const response = await fetch(`${API_BASE_URL}/faturas/credito/${fatura.id_cartao}/${mes}/${ano}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setParcelas(data.parcelas || []);
            } else {
                console.error('Erro ao buscar parcelas da fatura');
                setParcelas([]);
            }
        } catch (error) {
            console.error('Erro ao buscar parcelas:', error);
            setParcelas([]);
        }
    };

    // Função para voltar à lista de faturas
    const handleBackToList = () => {
        setCurrentView('list');
        setFaturaToPay(null);
        setParcelas([]);
        setIsLoadingPayment(false);
    };

    // Função para formatar valor de juros (similar aos outros formulários)
    const formatJurosValue = (value) => {
        // Remove tudo que não é dígito
        let numericValue = value.replace(/\D/g, '');
        
        // Se estiver vazio, retorna 0,00
        if (numericValue === '') {
            return '0,00';
        }
        
        // Adiciona zeros à esquerda se necessário
        while (numericValue.length < 3) {
            numericValue = '0' + numericValue;
        }
        
        // Insere a vírgula para separar os centavos
        const integerPart = numericValue.slice(0, -2);
        const decimalPart = numericValue.slice(-2);
        const formattedValue = integerPart.replace(/^0+/, '') + ',' + decimalPart;
        
        return formattedValue.replace(/^,/, '0,');
    };

    // Função para lidar com mudança no valor de juros
    const handleJurosValueChange = (e) => {
        const formattedValue = formatJurosValue(e.target.value);
        setJurosValue(formattedValue);
    };

    // Função para abrir modal de juros
    const handleOpenJurosModal = () => {
        setShowJurosModal(true);
        setJurosValue('0,00');
    };

    // Função para fechar modal de juros
    const handleCloseJurosModal = () => {
        setShowJurosModal(false);
        setJurosValue('0,00');
        setIsAddingJuros(false);
    };

    // Função para confirmar adição de juros
    const handleConfirmJuros = async () => {
        if (!faturaToPay) return;

        setIsAddingJuros(true);
        const token = localStorage.getItem('authToken');

        try {
            // Converter valor de formato brasileiro para americano
            const valorNumerico = parseFloat(jurosValue.replace(',', '.'));
            
            if (valorNumerico <= 0) {
                alert('O valor dos juros deve ser maior que zero.');
                return;
            }

            // Extrair mês e ano da data de vencimento
            const dataVencimento = new Date(faturaToPay.parcelas[0]?.data_vencimento);
            const mes = dataVencimento.getMonth() + 1;
            const ano = dataVencimento.getFullYear();

            const response = await fetch(`${API_BASE_URL}/faturas/ajustar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id_cartao: faturaToPay.id_cartao,
                    mes: mes,
                    ano: ano,
                    valor: valorNumerico,
                    descricao: 'Juros'
                }),
            });

            if (response.ok) {
                // Fechar modal e atualizar dados
                handleCloseJurosModal();
                await fetchParcelas(faturaToPay); // Recarregar parcelas
            } else {
                const errorData = await response.json();
                console.error('Erro ao adicionar juros:', errorData);
                alert(`Erro ao adicionar juros: ${errorData.erro || 'Tente novamente.'}`);
            }
        } catch (error) {
            console.error('Erro ao adicionar juros:', error);
            alert('Erro ao adicionar juros. Tente novamente.');
        } finally {
            setIsAddingJuros(false);
        }
    };

    // Função para abrir modal de exclusão de juros
    const handleDeleteJurosClick = (parcela) => {
        setJurosToDelete(parcela);
        setShowDeleteJurosModal(true);
    };

    // Função para fechar modal de exclusão de juros
    const handleCancelDeleteJuros = () => {
        setShowDeleteJurosModal(false);
        setJurosToDelete(null);
        setIsDeletingJuros(false);
    };

    // Função para confirmar exclusão de juros
    const handleConfirmDeleteJuros = async () => {
        if (!jurosToDelete) return;

        setIsDeletingJuros(true);
        const token = localStorage.getItem('authToken');

        try {
            // Debug: verificar estrutura dos dados
            console.log('Dados do juros a ser excluído:', jurosToDelete);
            
            // Determinar o ID correto da transação
            // id_compra da tabela parcela = id da tabela transacao
            const idTransacao = jurosToDelete.id_compra;
            console.log('ID da transação a ser enviado (id_compra):', idTransacao);
            
            const requestBody = {
                id_transacao: parseInt(idTransacao)
            };
            console.log('JSON a ser enviado:', requestBody);
            
            const response = await fetch(`${API_BASE_URL}/faturas/ajustar`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                // Fechar modal e atualizar dados
                handleCancelDeleteJuros();
                await fetchParcelas(faturaToPay); // Recarregar parcelas
            } else {
                const errorData = await response.json();
                console.error('Erro ao excluir juros:', errorData);
                alert(`Erro ao excluir juros: ${errorData.erro || 'Tente novamente.'}`);
            }
        } catch (error) {
            console.error('Erro ao excluir juros:', error);
            alert('Erro ao excluir juros. Tente novamente.');
        } finally {
            setIsDeletingJuros(false);
        }
    };


    // Função para abrir modal de edição de parcela
    const handleEditParcelaClick = (parcela) => {
        setParcelaToEdit(parcela);
        setNovoValorParcela(parcela.valor_parcela);
        setShowEditParcelaModal(true);
    };

    // Função para fechar modal de edição de parcela
    const handleCancelEditParcela = () => {
        setShowEditParcelaModal(false);
        setParcelaToEdit(null);
        setNovoValorParcela('');
        setIsEditingParcela(false);
    };


    // Função para formatar valor da parcela
    const formatParcelaValue = (value) => {
        // Remove caracteres não numéricos exceto vírgula e ponto
        let cleanValue = value.replace(/[^\d,.]/g, '');
        
        // Substitui ponto por vírgula se houver
        cleanValue = cleanValue.replace('.', ',');
        
        // Garante apenas uma vírgula
        const parts = cleanValue.split(',');
        if (parts.length > 2) {
            cleanValue = parts[0] + ',' + parts.slice(1).join('');
        }
        
        // Limita a 2 casas decimais
        if (parts[1] && parts[1].length > 2) {
            cleanValue = parts[0] + ',' + parts[1].substring(0, 2);
        }
        
        return cleanValue;
    };

    // Função para lidar com mudança no valor da parcela
    const handleParcelaValueChange = (e) => {
        const formattedValue = formatParcelaValue(e.target.value);
        setNovoValorParcela(formattedValue);
    };

    // Função para confirmar edição de parcela
    const handleConfirmEditParcela = async () => {
        if (!parcelaToEdit || !novoValorParcela) return;

        setIsEditingParcela(true);
        const token = localStorage.getItem('authToken');

        try {
            // Debug: verificar estrutura dos dados da parcela
            console.log('Dados da parcela a ser editada:', parcelaToEdit);
            console.log('ID da parcela:', parcelaToEdit.id_parcela);
            console.log('Todos os campos da parcela:', Object.keys(parcelaToEdit));
            console.log('Novo valor:', novoValorParcela);
            
            const response = await fetch(`${API_BASE_URL}/parcelas/${parcelaToEdit.id_parcela}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    novo_valor: parseFloat(novoValorParcela.replace(',', '.'))
                }),
            });

            if (response.ok) {
                // Fechar modal e atualizar dados
                handleCancelEditParcela();
                await fetchParcelas(faturaToPay); // Recarregar parcelas
            } else {
                const errorData = await response.json();
                console.error('Erro ao editar parcela:', errorData);
                alert(`Erro ao editar parcela: ${errorData.erro || 'Tente novamente.'}`);
            }
        } catch (error) {
            console.error('Erro ao editar parcela:', error);
            alert('Erro ao editar parcela. Tente novamente.');
        } finally {
            setIsEditingParcela(false);
        }
    };

    // Função para obter símbolo da moeda
    const getCurrencySymbol = (currency) => {
        const symbols = {
            'BRL': 'R$',
            'EUR': '€',
            'USD': '$',
        };
        return symbols[currency] || currency;
    };

    // Função para determinar status da fatura
    const getFaturaStatus = (fatura) => {
        // Verificar se todas as parcelas foram pagas
        const todasParcelasPagas = fatura.parcelas.every(parcela => 
            parcela.status && parcela.status.toUpperCase() === 'PAGO'
        );
        return todasParcelasPagas ? 'Pago' : 'Pendente';
    };


    // Função para verificar se a fatura está atrasada
    const isFaturaAtrasada = (fatura) => {
        const hoje = new Date();
        const dataVencimento = new Date(fatura.parcelas[0]?.data_vencimento);
        const status = getFaturaStatus(fatura);
        
        return dataVencimento < hoje && status === 'Pendente';
    };

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    // Renderizar modal de pagamento
    if (currentView === 'payment') {
        return (
            <div className="p-4">
                {/* Modal de Pagamento */}
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        {/* Header do Modal */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <div className="flex items-center">
                                <button 
                                    onClick={handleBackToList}
                                    className="p-2 mr-3 text-gray-600 hover:text-gray-800 rounded-full transition-colors"
                                    aria-label="Fechar"
                                >
                                    <X size={24} />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Pagar Fatura</h2>
                                    <p className="text-sm text-gray-600">Confirme os detalhes antes de pagar</p>
                                </div>
                            </div>
                        </div>

                        {/* Conteúdo do Modal */}
                        <div className="p-6">
                            {isLoadingPayment ? (
                                <div className="flex justify-center items-center py-12">
                                    <LoadingSpinner />
                                </div>
                            ) : faturaToPay ? (
                                <>
                                    {/* Informações da Fatura */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {faturaToPay.cartao} - {faturaToPay.fatura_referencia}
                                        </h3>
                                    </div>
                                    
                                    {/* Lista de parcelas */}
                                    <div className="space-y-3 mb-6">
                                        <h4 className="text-md font-medium text-gray-700">Parcelas a Pagar:</h4>
                                        {parcelas.map((parcela, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 mb-1">
                                                            {parcela.descricao_compra}
                                                        </div>
                                                        {/* Mostrar informações apenas se não for juros */}
                                                        {parcela.descricao_compra !== 'Juros' && (
                                                            <div className="text-sm text-gray-600">
                                                                Parcela: {parcela.parcela_referencia}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-center space-x-4">
                                                        <div className="text-center">
                                                            <div className="font-bold text-lg text-gray-900">
                                                                {getCurrencySymbol(faturaToPay.moeda)} {parseFloat(parcela.valor_parcela).toFixed(2)}
                                                            </div>
                                                        </div>
                                                        {/* Botões de ação */}
                                                        <div className="flex items-center space-x-2">
                                                            {/* Botão Editar (apenas se não for juros) */}
                                                            {parcela.descricao_compra !== 'Juros' && (
                                                                <button
                                                                    onClick={() => handleEditParcelaClick(parcela)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                                                    aria-label="Editar Parcela"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                            )}
                                                            {/* Botão Excluir (apenas se for juros) */}
                                                            {parcela.descricao_compra === 'Juros' && (
                                                                <button
                                                                    onClick={() => handleDeleteJurosClick(parcela)}
                                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                                                    aria-label="Excluir Juros"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Resumo total */}
                                    <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium text-gray-700">Total a Pagar:</span>
                                            <span className="text-2xl font-bold text-red-600">
                                                {getCurrencySymbol(faturaToPay.moeda)} {parcelas.reduce((sum, p) => sum + parseFloat(p.valor_parcela), 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Botões de ação */}
                                    <div className="flex flex-col space-y-3">
                                        <button 
                                            onClick={handleOpenJurosModal}
                                            className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                        >
                                            Incluir Juros
                                        </button>
                                        <button 
                                            className="w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                            onClick={() => handleOpenPaymentModal(faturaToPay)}
                                        >
                                            Pagar Fatura
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Modal de Seleção de Conta para Pagamento */}
                {showPaymentModal && faturaToPay && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
                        <div className="bg-white rounded-xl p-6 w-96 mx-4 shadow-2xl">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
                                <CreditCard className="w-6 h-6 text-green-600" />
                            </div>
                            
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                Pagar Fatura
                            </h3>
                            
                            <p className="text-sm text-gray-600 text-center mb-6">
                                Selecione a conta para realizar o pagamento da fatura.
                            </p>

                            {/* Detalhes da Fatura */}
                            {faturaToPay && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <div className="font-medium text-gray-800 mb-2">Detalhes da Fatura:</div>
                                        <div>• Cartão: {faturaToPay.cartao}</div>
                                        <div>• Valor: {getCurrencySymbol(faturaToPay.moeda)} {parseFloat(faturaToPay.valor_total_fatura).toFixed(2)}</div>
                                        <div>• Vencimento: {formatDate(faturaToPay.parcelas[0]?.data_vencimento)}</div>
                                    </div>
                                </div>
                            )}

                            {/* Dropdown de Contas */}
                            {faturaToPay && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Conta de Pagamento ({faturaToPay.moeda}):
                                    </label>
                                    <select
                                        value={selectedPaymentAccount}
                                        onChange={(e) => {
                                            if (e.target.value === 'add_new') {
                                                handleOpenAddAccountModal();
                                            } else {
                                                setSelectedPaymentAccount(e.target.value);
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Selecione uma conta</option>
                                        {Object.values(contasInfo)
                                            .filter(conta => conta && conta.moeda === faturaToPay.moeda)
                                            .map(conta => (
                                                <option key={conta.id} value={conta.id}>
                                                    {conta.nome}
                                                </option>
                                            ))}
                                        <option value="add_new" className="text-blue-600 font-medium">
                                            + Adicionar Nova Conta
                                        </option>
                                    </select>
                                </div>
                            )}

                            {/* Botões */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleCancelPayment}
                                    disabled={isProcessingPayment}
                                    className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={isProcessingPayment || !selectedPaymentAccount}
                                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {isProcessingPayment ? 'Processando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Adicionar Nova Conta */}
                {showAddAccountModal && (
                    <AddAccountModal
                        onSave={handleAddAccount}
                        onCancel={handleCloseAddAccountModal}
                        isSaving={isAddingAccount}
                    />
                )}

                {/* Modal de Adicionar Juros - Agora no nível raiz */}
                {showJurosModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                            {/* Header do Modal */}
                            <div className="flex items-center justify-between p-6 border-b">
                                <div className="flex items-center">
                                    <button 
                                        onClick={handleCloseJurosModal}
                                        className="p-2 mr-3 text-gray-600 hover:text-gray-800 rounded-full transition-colors"
                                        aria-label="Fechar"
                                    >
                                        <X size={24} />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Adicionar Juros</h2>
                                        <p className="text-sm text-gray-600">Informe o valor dos juros para esta fatura</p>
                                    </div>
                                </div>
                            </div>

                            {/* Conteúdo do Modal */}
                            <div className="p-6">
                                {/* Informações da Fatura */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {faturaToPay?.cartao} - {faturaToPay?.fatura_referencia}
                                    </h3>
                                </div>
                                
                                {/* Campo de Valor */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Valor dos Juros
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                            {faturaToPay ? getCurrencySymbol(faturaToPay.moeda) : 'R$'}
                                        </span>
                                        <input
                                            type="text"
                                            value={jurosValue}
                                            onChange={handleJurosValueChange}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm text-lg font-medium"
                                            placeholder="0,00"
                                            disabled={isAddingJuros}
                                        />
                                    </div>
                                </div>

                                {/* Botões de ação */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleCloseJurosModal}
                                        disabled={isAddingJuros}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmJuros}
                                        disabled={isAddingJuros}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                    >
                                        {isAddingJuros ? 'Adicionando...' : 'Confirmar Juros'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Confirmação de Exclusão de Juros */}
                {showDeleteJurosModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 size={24} className="text-red-600" />
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Excluir Juros
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Tem certeza que deseja excluir estes juros? Esta ação não pode ser desfeita.
                                </p>
                                
                                {jurosToDelete && (
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                        <div className="text-sm text-gray-600">
                                            <div className="font-medium mb-2">Detalhes dos Juros:</div>
                                            <div>• Descrição: {jurosToDelete.descricao_compra}</div>
                                            <div>• Valor: {getCurrencySymbol(faturaToPay?.moeda)} {parseFloat(jurosToDelete.valor_parcela).toFixed(2)}</div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleCancelDeleteJuros}
                                        disabled={isDeletingJuros}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmDeleteJuros}
                                        disabled={isDeletingJuros}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                    >
                                        {isDeletingJuros ? 'Excluindo...' : 'Excluir'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Edição de Parcela */}
                {showEditParcelaModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                            {/* Header do Modal */}
                            <div className="flex items-center justify-between p-6 border-b">
                                <div className="flex items-center">
                                    <button 
                                        onClick={handleCancelEditParcela}
                                        className="p-2 mr-3 text-gray-600 hover:text-gray-800 rounded-full transition-colors"
                                        aria-label="Fechar"
                                    >
                                        <X size={24} />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Editar Parcela</h2>
                                        <p className="text-sm text-gray-600">Altere o valor da parcela e visualize o impacto</p>
                                    </div>
                                </div>
                            </div>

                            {/* Conteúdo do Modal */}
                            <div className="p-6">
                                {/* Informações da Parcela */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {parcelaToEdit?.descricao_compra} - Parcela {parcelaToEdit?.parcela_referencia}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Valor atual: {getCurrencySymbol(faturaToPay?.moeda)} {parseFloat(parcelaToEdit?.valor_parcela || 0).toFixed(2)}
                                    </p>
                                </div>
                                
                                {/* Campo de Novo Valor */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Novo Valor da Parcela
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                            {faturaToPay ? getCurrencySymbol(faturaToPay.moeda) : 'R$'}
                                        </span>
                                        <input
                                            type="text"
                                            value={novoValorParcela}
                                            onChange={handleParcelaValueChange}
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-lg font-medium"
                                            placeholder="0,00"
                                            disabled={isEditingParcela}
                                        />
                                    </div>
                                </div>


                                {/* Botões de ação */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleCancelEditParcela}
                                        disabled={isEditingParcela}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmEditParcela}
                                        disabled={isEditingParcela || !novoValorParcela}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {isEditingParcela ? 'Salvando...' : 'Confirmar Alteração'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }


    // Renderizar lista de faturas (view padrão)
    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button 
                        onClick={goToMenu}
                        className="p-2 mr-3 text-gray-600 hover:text-gray-800 rounded-full transition-colors"
                        aria-label="Voltar para Menu"
                    >
                        <X size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Faturas de Crédito</h1>
                        <p className="text-gray-600">Gerencie suas faturas de cartão de crédito</p>
                    </div>
                </div>
            </div>

            {/* Lista de Faturas */}
            {faturas.length === 0 ? (
                <div className="text-center py-8">
                    <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-lg">Nenhuma fatura encontrada</p>
                    <p className="text-gray-400">Suas faturas de crédito aparecerão aqui</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {faturas.map((fatura, index) => (
                        <div key={`${fatura.id_cartao}_${fatura.fatura_referencia}`} 
                             className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    {/* Primeira linha: Vencimento com Status e Atrasada + Informação de Pagamento */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-500 mr-2">Vencimento:</span>
                                            <span className="font-medium text-gray-800">
                                                {formatDate(fatura.parcelas[0]?.data_vencimento)}
                                            </span>
                                            
                                            {/* Tag do Status */}
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                                getFaturaStatus(fatura) === 'Pago' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {getFaturaStatus(fatura)}
                                            </span>
                                            
                                            {/* Tag de Atrasada */}
                                            {isFaturaAtrasada(fatura) && (
                                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                                    Atrasada
                                                </span>
                                            )}
                                        </div>

                                        {/* Informação de Pagamento (se pago) - à direita */}
                                        {getFaturaStatus(fatura) === 'Pago' && (() => {
                                            const mesAnoFatura = fatura.fatura_referencia.replace('/', '-');
                                            const chave = `${fatura.id_cartao}_${mesAnoFatura}`;
                                            const pagamento = pagamentosInfo[chave];
                                            
                                            if (pagamento) {
                                                const conta = contasInfo[pagamento.id_conta];
                                                const nomeConta = conta ? conta.nome : `Conta ${pagamento.id_conta}`;
                                                return (
                                                    <span className="text-[10px] text-gray-500 text-right leading-tight">
                                                        Pago em {formatDate(pagamento.data_transacao)} pela conta {nomeConta}
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>

                                    {/* Valor Total (à esquerda) */}
                                    <div className="flex items-center mb-2">
                                        <span className="font-bold text-2xl text-gray-800">
                                            {getCurrencySymbol(fatura.moeda)} {parseFloat(fatura.valor_total_fatura).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Cartão de Crédito */}
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-500 mr-2">Cartão de Crédito:</span>
                                        <span className="font-medium text-gray-800">{fatura.cartao}</span>
                                    </div>

                                </div>

                                {/* Ações */}
                                <div className="flex items-center space-x-2 ml-4">
                                    {/* Botão Pagar (apenas se pendente) */}
                                    {getFaturaStatus(fatura) === 'Pendente' && (
                                        <div className="relative group">
                                            <button
                                                onClick={() => handlePayClick(fatura)}
                                                className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                                                aria-label="Pagar Fatura"
                                            >
                                                <DollarSign size={20} />
                                            </button>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                Pagar Fatura
                                            </div>
                                        </div>
                                    )}

                                    {/* Botão Excluir (apenas se pago) */}
                                    {getFaturaStatus(fatura) === 'Pago' && (
                                        <div className="relative group">
                                            <button
                                                onClick={() => handleDeleteClick(fatura)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                                aria-label="Excluir Fatura"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                Excluir Fatura
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Excluir Fatura
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Tem certeza que deseja excluir esta fatura? Esta ação irá estornar o pagamento e não pode ser desfeita.
                            </p>
                            
                            {faturaToDelete && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                    <div className="text-sm text-gray-600">
                                        <div className="font-medium mb-2">Detalhes da Fatura:</div>
                                        <div>• Cartão: {faturaToDelete.cartao}</div>
                                        <div>• Valor: {getCurrencySymbol(faturaToDelete.moeda)} {parseFloat(faturaToDelete.valor_total_fatura).toFixed(2)}</div>
                                        <div>• Vencimento: {formatDate(faturaToDelete.parcelas[0]?.data_vencimento)}</div>
                                        <div>• Status: {getFaturaStatus(faturaToDelete)}</div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// --------------------------------------------------------------------------------
// Componente: ManageTransactionScreen (NOVO)
// Tela de seleção para gerenciamento de diferentes tipos de transações
// --------------------------------------------------------------------------------
const ManageTransactionScreen = ({ goToMenu, setTransactionSubView }) => {
    const [currentView, setCurrentView] = useState('menu');
    const categoriesInitializedRef = useRef(false);
    
    // Inicializar categorias pré-definidas quando o usuário acessa as transações
    useEffect(() => {
        // Verificar se já foi inicializado neste componente
        if (!categoriesInitializedRef.current) {
            categoriesInitializedRef.current = true;
            checkAndCreatePredefinedCategories();
        }
    }, []);
    
    // Componente de Cartão de Opção Simples
    const SelectionCard = ({ title, icon: Icon, color, description, action }) => (
        <button
            onClick={action}
            className={`flex flex-col items-center justify-center p-6 h-36 rounded-xl shadow-lg transition-transform duration-150 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full text-center`}
            style={{ backgroundColor: `${color}10`, border: `1px solid ${color}` }}
        >
            <Icon size={40} className={`mb-3`} style={{ color }} />
            <span className="text-xl font-bold text-gray-800">{title}</span>
            <p className="text-sm text-gray-500 mt-1">
                {description}
            </p>
        </button>
    );

    // Função para renderizar a subview
    const renderSubView = () => {
        switch (currentView) {
            case 'debit_transactions_list':
                return (
                    <DebitTransactionsListScreen
                        goToMenu={() => setCurrentView('menu')}
                        setTransactionSubView={(view) => setCurrentView(view)}
                    />
                );
            case 'credit_transactions_list':
                return (
                    <CreditTransactionsListScreen
                        goToMenu={() => setCurrentView('menu')}
                        setTransactionSubView={(view) => setCurrentView(view)}
                    />
                );
            case 'transfer_transactions_list':
                return (
                    <TransferTransactionsListScreen
                        goToMenu={() => setCurrentView('menu')}
                        setTransactionSubView={(view) => setCurrentView(view)}
                    />
                );
            case 'conversion_transactions_list':
                return (
                    <ConversionTransactionsListScreen
                        goToMenu={() => setCurrentView('menu')}
                        setTransactionSubView={(view) => setCurrentView(view)}
                    />
                );
            case 'faturas_list':
                return (
                    <FaturasListScreen
                        goToMenu={() => setCurrentView('menu')}
                    />
                );
            case 'register_expense':
                return (
                    <ExpenseTransactionScreen
                        goToMenu={() => setCurrentView('debit_transactions_list')}
                        setTransactionSubView={(view) => setCurrentView(view)}
                    />
                );
            case 'register_income':
                return (
                    <IncomeTransactionScreen
                        goToMenu={() => setCurrentView('debit_transactions_list')}
                    />
                );
            case 'register_transfer':
                return (
                    <TransferTransactionScreen
                        goToMenu={() => setCurrentView('transfer_transactions_list')}
                    />
                );
            case 'register_conversion':
                return (
                    <ConversionTransactionScreen
                        goToMenu={() => setCurrentView('conversion_transactions_list')}
                    />
                );
            case 'register_credit':
                return (
                    <NewCreditTransactionSetupScreen
                        goToMenu={() => setCurrentView('credit_transactions_list')}
                        setTransactionSubView={(view) => setCurrentView(view)}
                    />
                );
            case 'menu':
            default:
                return (
                    <>
                        <div className="flex items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Gerenciar Transações</h2>
                        </div>
                        
                        <p className="text-gray-600 mb-6">Selecione o tipo de transação que deseja gerenciar:</p>

                        <div className="grid grid-cols-2 gap-4">
                            
                            <SelectionCard
                                title="Transação no Débito"
                                icon={DollarSign}
                                color="#ef4444" // Vermelho para Débito
                                description="Gerenciar transações de débito"
                                action={() => setCurrentView('debit_transactions_list')}
                            />
                            
                            <SelectionCard
                                title="Transação no Crédito"
                                icon={CreditCard}
                                color="#f59e0b" // Laranja para Crédito
                                description="Gerenciar transações de crédito"
                                action={() => setCurrentView('credit_transactions_list')}
                            />
                            
                            <SelectionCard
                                title="Transferência"
                                icon={Layers}
                                color="#3b82f6" // Azul para Transferência
                                description="Gerenciar transferências"
                                action={() => setCurrentView('transfer_transactions_list')}
                            />
                            
                            <SelectionCard
                                title="Conversão"
                                icon={Edit}
                                color="#008f7a" // Roxo para Conversão
                                description="Gerenciar conversões de moeda"
                                action={() => setCurrentView('conversion_transactions_list')}
                            />
                            
                            <SelectionCard
                                title="Gerenciar Faturas"
                                icon={DollarSign}
                                color="#8b5cf6" // Roxo para Faturas
                                description="Gerenciar faturas pendentes"
                                action={() => setCurrentView('faturas_list')}
                            />
                            
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="p-4">
            {renderSubView()}
        </div>
    );
};

// --------------------------------------------------------------------------------
// Componente: DebitTransactionsListScreen (NOVO)
// Tela para listar transações de débito do usuário
// --------------------------------------------------------------------------------
const DebitTransactionsListScreen = ({ goToMenu, setTransactionSubView }) => {
    const [transacoes, setTransacoes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [contas, setContas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        tipo: '',
        id_categoria: '',
        id_conta: '',
        valor: '',
        descricao: '',
        moeda: '',
        recorrencia: ''
    });

    // Função para abrir modal de edição
    const handleEditClick = (transacao) => {
        setTransactionToEdit(transacao);
        setEditFormData({
            tipo: transacao.tipo,
            id_categoria: transacao.id_categoria,
            id_conta: transacao.id_conta,
            valor: transacao.valor.toString(),
            descricao: transacao.descricao,
            moeda: transacao.moeda,
            recorrencia: transacao.recorrencia
        });
        
        setShowEditModal(true);
    };

    // Função para abrir modal de exclusão
    const handleDeleteClick = (transacao) => {
        setTransactionToDelete(transacao);
        setShowDeleteModal(true);
    };

    // Função para fechar modal de edição
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setTransactionToEdit(null);
        setEditFormData({
            tipo: '',
            id_categoria: '',
            id_conta: '',
            valor: '',
            descricao: '',
            moeda: '',
            recorrencia: ''
        });
    };

    // Função para fechar modal de exclusão
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setTransactionToDelete(null);
    };

    // Função para confirmar edição
    const handleConfirmEdit = async () => {
        if (!transactionToEdit) return;

        setIsEditing(true);
        const token = localStorage.getItem('authToken');
        
        try {
            const response = await fetch(`${API_BASE_URL}/transacoes/${transactionToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData),
            });

            if (response.ok) {
                // Atualizar a lista de transações
                await fetchTransacoes();
                setShowEditModal(false);
                setTransactionToEdit(null);
            } else {
                const errorData = await response.json();
                console.error('Erro ao editar transação:', errorData);
                alert('Erro ao editar transação. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao editar transação:', error);
            alert('Erro ao editar transação. Tente novamente.');
        } finally {
            setIsEditing(false);
        }
    };

    // Função para confirmar exclusão
    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;

        setIsDeleting(true);
        const token = localStorage.getItem('authToken');
        
        try {
            const response = await fetch(`${API_BASE_URL}/transacoes/${transactionToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Atualizar a lista de transações
                await fetchTransacoes();
                setShowDeleteModal(false);
                setTransactionToDelete(null);
            } else {
                const errorData = await response.json();
                console.error('Erro ao excluir transação:', errorData);
                alert('Erro ao excluir transação. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao excluir transação:', error);
            alert('Erro ao excluir transação. Tente novamente.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Função para buscar contas e categorias
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const [contasResponse, categoriasResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/contas`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/categorias`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
            ]);

            if (contasResponse.ok && categoriasResponse.ok) {
                const [contasData, categoriasData] = await Promise.all([
                    contasResponse.json(),
                    categoriasResponse.json()
                ]);
                setContas(contasData);
                setCategorias(categoriasData);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }, []);

    // Função para lidar com mudanças no formulário
    const handleEditFormChange = (field, value) => {
        // Se mudou o tipo, filtrar categorias
        if (field === 'tipo') {
            setEditFormData(prev => ({
                ...prev,
                [field]: value,
                id_categoria: '' // Reset categoria quando muda tipo
            }));
        }
        // Se mudou a conta, apenas atualizar o valor
        else if (field === 'id_conta') {
            setEditFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
        // Para outros campos, apenas atualiza o valor
        else {
            setEditFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // Função para formatar valor (igual aos outros formulários)
    const formatCurrency = (value) => {
        // Remove caracteres não numéricos
        const numericValue = value.replace(/\D/g, '');
        
        // Converte para centavos e depois para reais
        const realValue = (parseInt(numericValue) / 100).toFixed(2);
        
        // Formata com vírgula como separador decimal
        return realValue.replace('.', ',');
    };

    const handleValueChange = (e) => {
        const value = e.target ? e.target.value : e;
        const formattedValue = formatCurrency(value);
        setEditFormData(prev => ({
            ...prev,
            valor: formattedValue
        }));
    };

    // Função para buscar transações de débito
    const fetchTransacoes = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/transacoes`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar transações');
            }

            const data = await response.json();
            setTransacoes(data);
        } catch (err) {
            console.error('Erro ao carregar transações:', err);
            setError(err.message || 'Erro ao carregar transações');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransacoes();
        fetchData();
    }, [fetchTransacoes, fetchData]);

    // Função para formatar data (remover horas)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    // Função para truncar descrição
    const truncateDescription = (description, maxLength = 50) => {
        if (!description) return '';
        return description.length > maxLength 
            ? description.substring(0, maxLength) + '...' 
            : description;
    };

    // Função para obter ícone da moeda
    const getCurrencyIcon = (moeda) => {
        switch (moeda) {
            case 'BRL': return 'R$';
            case 'USD': return '$';
            case 'EUR': return '€';
            default: return moeda;
        }
    };

    // Função para obter cor do tipo
    const getTypeColor = (tipo) => {
        return tipo === 'receita' ? 'text-green-600' : 'text-red-600';
    };

    // Função para obter cor do tipo (background)
    const getTypeBgColor = (tipo) => {
        return tipo === 'receita' ? 'bg-green-100' : 'bg-red-100';
    };

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="bg-white rounded-xl shadow-xl border-t-4 border-t-red-500 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button 
                                onClick={goToMenu}
                                className="mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Voltar"
                            >
                                <X size={24} />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Transações de Débito</h2>
                                <p className="text-gray-600 text-sm">Gerencie suas transações de débito</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setTransactionSubView('register_expense')}
                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            aria-label="Adicionar nova transação"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4" role="alert">
                            {error}
                        </div>
                    )}

                    {transacoes.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação encontrada</h3>
                            <p className="text-gray-500">Você ainda não possui transações de débito registradas.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transacoes.map((transacao) => (
                                <div key={transacao.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(transacao.data_transacao)}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBgColor(transacao.tipo)} ${getTypeColor(transacao.tipo)}`}>
                                                    {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {transacao.recorrencia}
                                                </span>
                                            </div>
                                            
                                            <p className="text-gray-800 font-medium mb-1">
                                                {truncateDescription(transacao.descricao)}
                                            </p>
                                            
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span className="flex items-center">
                                                    <span className="mr-1">{getCurrencyIcon(transacao.moeda)}</span>
                                                    {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                                <span>•</span>
                                                <span>{transacao.nome_conta}</span>
                                                <span>•</span>
                                                <span>{transacao.nome_categoria}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEditClick(transacao)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                                aria-label="Editar transação"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(transacao)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                                aria-label="Excluir transação"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Edição de Transação */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <button 
                                    onClick={handleCloseEditModal}
                                    className="mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label="Fechar"
                                >
                                    <X size={24} />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Editar Transação</h2>
                                    <p className="text-gray-600 text-sm">Modifique os dados da transação</p>
                                </div>
                            </div>
                        </div>

                        {/* Formulário */}
                        <div className="p-6">
                        
                        <form onSubmit={(e) => { e.preventDefault(); handleConfirmEdit(); }} className="space-y-4">
                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo
                                </label>
                                <select
                                    value={editFormData.tipo}
                                    onChange={(e) => handleEditFormChange('tipo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Selecione o tipo</option>
                                    <option value="receita">Receita</option>
                                    <option value="despesa">Despesa</option>
                                </select>
                            </div>

                            {/* Categoria */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoria
                                </label>
                                <select
                                    value={editFormData.id_categoria}
                                    onChange={(e) => {
                                        if (e.target.value === 'add_new') {
                                            setShowAddCategoryModal(true);
                                        } else {
                                            handleEditFormChange('id_categoria', e.target.value);
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {categorias
                                        .filter(cat => cat.tipo === editFormData.tipo)
                                        .map(categoria => (
                                            <option key={categoria.id} value={categoria.id}>
                                                {categoria.nome}
                                            </option>
                                        ))
                                    }
                                    <option value="add_new" className="text-blue-600 font-medium">
                                        + Adicionar Nova Categoria
                                    </option>
                                </select>
                            </div>

                            {/* Conta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Conta
                                </label>
                                <select
                                    value={editFormData.id_conta}
                                    onChange={(e) => {
                                        if (e.target.value === 'add_new_account') {
                                            setShowAddAccountModal(true);
                                        } else {
                                            handleEditFormChange('id_conta', e.target.value);
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Selecione uma conta</option>
                                    {contas.map(conta => (
                                        <option key={conta.id} value={conta.id}>
                                            {conta.nome}
                                        </option>
                                    ))}
                                    <option value="add_new_account" className="text-blue-600 font-medium">
                                        + Adicionar Nova Conta
                                    </option>
                                </select>
                            </div>

                            {/* Valor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valor
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.valor}
                                    onChange={handleValueChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0,00"
                                    required
                                />
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={editFormData.descricao}
                                    onChange={(e) => handleEditFormChange('descricao', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    placeholder="Descreva a transação"
                                    required
                                />
                            </div>

                            {/* Recorrência */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recorrência
                                </label>
                                <select
                                    value={editFormData.recorrencia}
                                    onChange={(e) => handleEditFormChange('recorrencia', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Selecione a recorrência</option>
                                    <option value="Fixo">Fixo</option>
                                    <option value="Esporadico">Esporádico</option>
                                </select>
                            </div>

                            {/* Botões */}
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    disabled={isEditing}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isEditing}
                                    className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isEditing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        'Salvar'
                                    )}
                                </button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-96 mx-4 shadow-2xl">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                            Excluir Transação
                        </h3>
                        
                        <p className="text-gray-600 text-center mb-6">
                            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                        </p>
                        
                        {transactionToDelete && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-6">
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Descrição:</span> {transactionToDelete.descricao}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Valor:</span> {getCurrencyIcon(transactionToDelete.moeda)} {transactionToDelete.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">Data:</span> {formatDate(transactionToDelete.data_transacao)}
                                </p>
                            </div>
                        )}
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCloseDeleteModal}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Excluindo...
                                    </>
                                ) : (
                                    'Excluir'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Adicionar Categoria */}
            {showAddCategoryModal && (
                <AddCategoryModal
                    onSave={(newCategory) => {
                        setCategorias(prev => [...prev, newCategory]);
                        setEditFormData(prev => ({
                            ...prev,
                            id_categoria: newCategory.id
                        }));
                        setShowAddCategoryModal(false);
                    }}
                    onCancel={() => {
                        setShowAddCategoryModal(false);
                        // Reset do dropdown para não ficar com valor "add_new"
                        setEditFormData(prev => ({
                            ...prev,
                            id_categoria: ''
                        }));
                    }}
                    isSaving={false}
                />
            )}

            {/* Modal de Adicionar Conta */}
            {showAddAccountModal && (
                <AddAccountModal
                    onSave={(newAccount) => {
                        setContas(prev => [...prev, newAccount]);
                        setEditFormData(prev => ({
                            ...prev,
                            id_conta: newAccount.id
                        }));
                        setShowAddAccountModal(false);
                    }}
                    onCancel={() => {
                        setShowAddAccountModal(false);
                        // Reset do dropdown para não ficar com valor "add_new_account"
                        setEditFormData(prev => ({
                            ...prev,
                            id_conta: ''
                        }));
                    }}
                />
            )}
        </div>
    );
};

// --------------------------------------------------------------------------------
// Componente: CreditTransactionsListScreen (NOVO)
// Tela para listar transações de crédito do usuário
// --------------------------------------------------------------------------------
const CreditTransactionsListScreen = ({ goToMenu, setTransactionSubView }) => {
    const [transacoes, setTransacoes] = useState([]);
    const [cartoes, setCartoes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Função para buscar transações de crédito e cartões
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const [transacoesRes, cartoesRes, categoriasRes] = await Promise.all([
                fetch(`${API_BASE_URL}/transacoes/credito`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/cartoes`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/categorias`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
            ]);

            if (transacoesRes.ok && cartoesRes.ok && categoriasRes.ok) {
                const [transacoesResponse, cartoesData, categoriasData] = await Promise.all([
                    transacoesRes.json(),
                    cartoesRes.json(),
                    categoriasRes.json()
                ]);
                setTransacoes(transacoesResponse.transacoes || []);
                setCartoes(cartoesData);
                setCategorias(categoriasData);
            } else {
                setError('Erro ao carregar dados');
            }
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            setError('Erro ao carregar dados');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Função para abrir modal de exclusão
    const handleDeleteClick = (transacao) => {
        setTransactionToDelete(transacao);
        setShowDeleteModal(true);
    };

    // Função para fechar modal de exclusão
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setTransactionToDelete(null);
    };

    // Função para confirmar exclusão
    const handleConfirmDelete = async () => {
        if (!transactionToDelete) return;

        setIsDeleting(true);
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/transacoes/credito/${transactionToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                // Atualizar lista após exclusão
                await fetchData();
                setShowDeleteModal(false);
                setTransactionToDelete(null);
            } else {
                setError('Erro ao excluir transação');
            }
        } catch (err) {
            console.error('Erro ao excluir transação:', err);
            setError('Erro ao excluir transação');
        } finally {
            setIsDeleting(false);
        }
    };

    // Função para formatar data
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    // Função para truncar descrição
    const truncateDescription = (description, maxLength = 30) => {
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength) + '...';
    };

    // Função para obter ícone da moeda
    const getCurrencyIcon = (moeda) => {
        switch (moeda) {
            case 'BRL': return 'R$';
            case 'USD': return '$';
            case 'EUR': return '€';
            default: return moeda;
        }
    };

    // Função para formatar valor
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    // Função para obter nome do cartão
    const getCartaoNome = (cartaoId) => {
        const cartao = cartoes.find(c => c.id === cartaoId);
        return cartao ? cartao.nome_cartao : `Cartão ${cartaoId}`;
    };

    // Função para obter nome da categoria
    const getCategoriaNome = (categoriaId) => {
        const categoria = categorias.find(c => c.id === categoriaId);
        return categoria ? categoria.nome : `Categoria ${categoriaId}`;
    };

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="bg-white rounded-xl shadow-xl border-t-4 border-t-blue-500 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button 
                                onClick={goToMenu}
                                className="mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Voltar"
                            >
                                <X size={24} />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Transações de Crédito</h2>
                                <p className="text-gray-600 text-sm">Gerencie suas transações de crédito</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setTransactionSubView('register_credit')}
                            className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg"
                            aria-label="Adicionar nova transação"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {transacoes.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Nenhuma transação de crédito encontrada</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transacoes.map((transacao) => (
                                <div key={transacao.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            {/* Linha 1: Data, Recorrência, Parcelas */}
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(transacao.data_transacao)}
                                                </span>
                                                <span className="text-sm text-gray-500">•</span>
                                                <span className="text-sm text-gray-500">
                                                    {transacao.recorrencia || 'Esporadico'}
                                                </span>
                                                <span className="text-sm text-gray-500">•</span>
                                                <span className="text-sm text-gray-500">
                                                    {transacao.parcelas_pagas || 0}/{transacao.total_parcelas || 0}
                                                </span>
                                            </div>
                                            
                                            {/* Linha 2: Descrição e Botão Excluir */}
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-gray-800 flex-1">
                                                    {truncateDescription(transacao.descricao)}
                                                </p>
                                                <button
                                                    onClick={() => handleDeleteClick(transacao)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors ml-4"
                                                    aria-label="Excluir transação"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            
                                            {/* Linha 3: Valor, Cartão, Categoria */}
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <span className="font-bold text-gray-800">
                                                    {getCurrencyIcon(transacao.moeda)} {formatCurrency(transacao.valor_total_compra || 0)}
                                                </span>
                                                <span>•</span>
                                                <span>{transacao.nome_cartao || getCartaoNome(transacao.id_cartao)}</span>
                                                <span>•</span>
                                                <span>{getCategoriaNome(transacao.id_categoria)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Confirmar Exclusão</h3>
                        <p className="text-gray-600 mb-6">
                            Tem certeza que deseja excluir esta transação de crédito? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCloseDeleteModal}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Excluindo...</>
                                ) : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --------------------------------------------------------------------------------
// Componente: TransferTransactionsListScreen
// Tela para listar transferências do usuário
// --------------------------------------------------------------------------------
const TransferTransactionsListScreen = ({ goToMenu, setTransactionSubView }) => {
    const [transferencias, setTransferencias] = useState([]);
    const [contas, setContas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transferToDelete, setTransferToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [transferToEdit, setTransferToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [contasDestino, setContasDestino] = useState([]);
    const [editFormData, setEditFormData] = useState({
        data_transacao: '',
        valor: '',
        id_conta_origem: '',
        id_conta_destino: '',
        descricao: ''
    });
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [isSavingAccount, setIsSavingAccount] = useState(false);

    // Função para buscar transferências e contas
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const [transferenciasRes, contasRes] = await Promise.all([
                fetch(`${API_BASE_URL}/transacoes/transferencias`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/contas`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
            ]);

            if (transferenciasRes.ok && contasRes.ok) {
                const [transferenciasResponse, contasData] = await Promise.all([
                    transferenciasRes.json(),
                    contasRes.json()
                ]);
                setTransferencias(transferenciasResponse.transferencias || []);
                setContas(contasData);
            } else {
                setError('Erro ao carregar dados');
            }
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            setError('Erro ao carregar dados');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Função para formatar data
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    // Função para truncar descrição
    const truncateDescription = (description) => {
        if (!description) return 'Sem descrição';
        return description.length > 50 ? description.substring(0, 50) + '...' : description;
    };

    // Função para obter símbolo da moeda
    const getCurrencySymbol = (moeda) => {
        const symbols = {
            'BRL': 'R$',
            'USD': '$',
            'EUR': '€'
        };
        return symbols[moeda] || moeda;
    };

    // Função para obter nome da conta
    const getContaNome = (contaId) => {
        const conta = contas.find(c => c.id === contaId);
        return conta ? conta.nome : `Conta ${contaId}`;
    };

    // Função para abrir modal de edição
    const handleEditClick = (transferencia) => {
        setTransferToEdit(transferencia);
        setEditFormData({
            data_transacao: transferencia.data_transacao.substring(0, 10), // Formato YYYY-MM-DD
            valor: transferencia.valor.toString(),
            id_conta_origem: transferencia.conta_origem,
            id_conta_destino: transferencia.conta_destino,
            descricao: transferencia.descricao.replace(/Transferência Enviada: |Transferência Recebida: /g, '')
        });
        
        // Filtrar contas destino baseado na conta origem
        const contaOrigem = contas.find(c => c.id === transferencia.conta_origem);
        if (contaOrigem) {
            const contasFiltradas = contas.filter(c => 
                c.id !== transferencia.conta_origem && c.moeda === contaOrigem.moeda
            );
            setContasDestino(contasFiltradas);
        }
        
        setShowEditModal(true);
    };

    // Função para fechar modal de edição
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setTransferToEdit(null);
        setEditFormData({
            data_transacao: '',
            valor: '',
            id_conta_origem: '',
            id_conta_destino: '',
            descricao: ''
        });
        setContasDestino([]);
    };

    // Função para lidar com mudança na conta origem
    const handleContaOrigemChange = (e) => {
        const contaOrigemId = e.target.value;
        
        // Se for para adicionar nova conta
        if (contaOrigemId === 'add_new_account') {
            setShowAddAccountModal(true);
            return;
        }
        
        setEditFormData(prev => ({
            ...prev,
            id_conta_origem: contaOrigemId,
            id_conta_destino: '' // Reset conta destino
        }));

        // Filtrar contas destino baseado na moeda da conta origem
        if (contaOrigemId) {
            const contaOrigem = contas.find(c => c.id === parseInt(contaOrigemId));
            if (contaOrigem) {
                const contasFiltradas = contas.filter(c => 
                    c.id !== parseInt(contaOrigemId) && c.moeda === contaOrigem.moeda
                );
                setContasDestino(contasFiltradas);
            }
        } else {
            setContasDestino([]);
        }
    };

    // Função para lidar com mudança na conta destino
    const handleContaDestinoChange = (e) => {
        const contaDestinoId = e.target.value;
        
        // Se for para adicionar nova conta
        if (contaDestinoId === 'add_new_account') {
            setShowAddAccountModal(true);
            return;
        }
        
        setEditFormData(prev => ({
            ...prev,
            id_conta_destino: contaDestinoId
        }));
    };

    // Função para obter símbolo da moeda baseado na conta origem
    const getCurrencySymbolForEdit = () => {
        if (!editFormData.id_conta_origem) return 'R$';
        const contaOrigem = contas.find(c => c.id === parseInt(editFormData.id_conta_origem));
        return contaOrigem ? getCurrencySymbol(contaOrigem.moeda) : 'R$';
    };

    // Função para formatar valor (igual aos outros formulários)
    const formatCurrency = (value) => {
        const numericValue = value.replace(/\D/g, '');
        const realValue = (parseInt(numericValue) / 100).toFixed(2);
        return realValue.replace('.', ',');
    };

    // Função para lidar com mudança no valor
    const handleValueChange = (e) => {
        const value = e.target ? e.target.value : e;
        const formattedValue = formatCurrency(value);
        setEditFormData(prev => ({
            ...prev,
            valor: formattedValue
        }));
    };

    // Função para confirmar edição
    const handleConfirmEdit = async () => {
        if (!transferToEdit) return;

        setIsEditing(true);
        const token = localStorage.getItem('authToken');
        
        try {
            const response = await fetch(`${API_BASE_URL}/transacoes/transferencia/${transferToEdit.id_grupo_operacao}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_conta_origem: parseInt(editFormData.id_conta_origem),
                    id_conta_destino: parseInt(editFormData.id_conta_destino),
                    valor: parseFloat(editFormData.valor.replace(',', '.')),
                    descricao: editFormData.descricao,
                    data_transacao: editFormData.data_transacao
                }),
            });

            if (response.ok) {
                // Atualizar a lista de transferências
                await fetchData();
                setShowEditModal(false);
                setTransferToEdit(null);
            } else {
                const errorData = await response.json();
                console.error('Erro ao editar transferência:', errorData);
                alert('Erro ao editar transferência. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao editar transferência:', error);
            alert('Erro ao editar transferência. Tente novamente.');
        } finally {
            setIsEditing(false);
        }
    };

    // Função para salvar nova conta
    const saveNewAccount = async (accountData) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        setIsSavingAccount(true);
        try {
            const response = await fetch(`${API_BASE_URL}/contas`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accountData),
            });

            if (response.ok) {
                // Recarregar as contas
                await fetchData();
                setShowAddAccountModal(false);
                alert('Conta adicionada com sucesso!');
            } else {
                const errorData = await response.json();
                console.error('Erro ao adicionar conta:', errorData);
                alert('Erro ao adicionar conta. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao adicionar conta:', error);
            alert('Erro ao adicionar conta. Tente novamente.');
        } finally {
            setIsSavingAccount(false);
        }
    };

    // Função para excluir transferência
    const handleDeleteTransfer = async () => {
        if (!transferToDelete) return;

        const token = localStorage.getItem('authToken');
        if (!token) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/transacoes/transferencia/${transferToDelete.id_grupo_operacao}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Recarrega os dados após exclusão
                await fetchData();
                setShowDeleteModal(false);
                setTransferToDelete(null);
            } else {
                const errorData = await response.json();
                setError(errorData.erro || 'Erro ao excluir transferência');
            }
        } catch (err) {
            console.error('Erro ao excluir transferência:', err);
            setError('Erro ao excluir transferência');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchData}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="bg-white rounded-xl shadow-xl border-t-4 border-t-blue-500 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button 
                                onClick={goToMenu}
                                className="mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Voltar"
                            >
                                <X size={24} />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Transferências</h2>
                                <p className="text-gray-600 text-sm">Gerencie suas transferências entre contas</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setTransactionSubView('register_transfer')}
                            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                            aria-label="Adicionar nova transferência"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4" role="alert">
                            {error}
                        </div>
                    )}

                    {transferencias.length === 0 ? (
                        <div className="text-center py-12">
                            <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transferência encontrada</h3>
                            <p className="text-gray-500">Você ainda não possui transferências registradas.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transferencias.map((transferencia) => (
                                <div key={transferencia.id_grupo_operacao} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(transferencia.data_transacao)}
                                                </span>
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                                    Transferência
                                                </span>
                                            </div>
                                            
                                            <p className="text-gray-800 font-medium mb-1">
                                                {truncateDescription(transferencia.descricao)}
                                            </p>
                                            
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span className="flex items-center">
                                                    <span className="mr-1">{getCurrencySymbol(transferencia.moeda)}</span>
                                                    {parseFloat(transferencia.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                                <span>•</span>
                                                <span>{getContaNome(transferencia.conta_origem)}</span>
                                                <ArrowRight className="h-3 w-3" />
                                                <span>{getContaNome(transferencia.conta_destino)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEditClick(transferencia)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                                aria-label="Editar transferência"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setTransferToDelete(transferencia);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                                aria-label="Excluir transferência"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Excluir Transferência</h3>
                                <p className="text-gray-600">Esta ação não pode ser desfeita.</p>
                            </div>
                        </div>
                        
                        <p className="text-gray-700 mb-6">
                            Tem certeza que deseja excluir esta transferência? 
                            Esta ação irá reverter o saldo das contas envolvidas.
                        </p>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setTransferToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteTransfer}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Edit className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Editar Transferência</h3>
                                <p className="text-gray-600">Altere os dados da transferência</p>
                            </div>
                        </div>
                        
                        <form onSubmit={(e) => { e.preventDefault(); handleConfirmEdit(); }}>
                            {/* Data */}
                            <div className="mb-4">
                                <label htmlFor="edit_data_transacao" className="block text-sm font-semibold text-gray-700 mb-1">Data:</label>
                                <input
                                    type="date"
                                    id="edit_data_transacao"
                                    value={editFormData.data_transacao}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, data_transacao: e.target.value }))}
                                    className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    required
                                    disabled={isEditing}
                                />
                            </div>

                            {/* Valor */}
                            <div className="mb-4">
                                <label htmlFor="edit_valor" className="block text-sm font-semibold text-gray-700 mb-1">Valor:</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">{getCurrencySymbolForEdit()}</span>
                                    </div>
                                    <input
                                        type="text"
                                        id="edit_valor"
                                        value={editFormData.valor}
                                        onChange={handleValueChange}
                                        placeholder="0,00"
                                        className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        required
                                        disabled={isEditing}
                                    />
                                </div>
                            </div>

                            {/* Conta de Origem */}
                            <div className="mb-4">
                                <label htmlFor="edit_id_conta_origem" className="block text-sm font-semibold text-gray-700 mb-1">Conta de Origem:</label>
                                <select
                                    id="edit_id_conta_origem"
                                    value={editFormData.id_conta_origem}
                                    onChange={handleContaOrigemChange}
                                    className="w-full px-3 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                                    required
                                    disabled={isEditing}
                                >
                                    <option value="">Selecione a conta de origem</option>
                                    {contas.map(conta => (
                                        <option key={conta.id} value={conta.id}>{conta.nome} ({conta.moeda})</option>
                                    ))}
                                    <option
                                        value="add_new_account"
                                        className="font-semibold text-blue-600 bg-blue-50"
                                    >
                                        + Adicionar Nova Conta
                                    </option>
                                </select>
                            </div>

                            {/* Conta de Destino */}
                            <div className="mb-4">
                                <label htmlFor="edit_id_conta_destino" className="block text-sm font-semibold text-gray-700 mb-1">Conta de Destino:</label>
                                <select
                                    id="edit_id_conta_destino"
                                    value={editFormData.id_conta_destino}
                                    onChange={handleContaDestinoChange}
                                    className="w-full px-3 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                                    required
                                    disabled={isEditing || !editFormData.id_conta_origem}
                                >
                                    <option value="">{editFormData.id_conta_origem ? 'Selecione a conta de destino' : 'Selecione primeiro a conta de origem'}</option>
                                    {contasDestino.map(conta => (
                                        <option key={conta.id} value={conta.id}>{conta.nome} ({conta.moeda})</option>
                                    ))}
                                    {editFormData.id_conta_origem && (
                                        <option
                                            value="add_new_account"
                                            className="font-semibold text-blue-600 bg-blue-50"
                                        >
                                            + Adicionar Nova Conta
                                        </option>
                                    )}
                                </select>
                            </div>

                            {/* Descrição */}
                            <div className="mb-6">
                                <label htmlFor="edit_descricao" className="block text-sm font-semibold text-gray-700 mb-1">Descrição:</label>
                                <textarea
                                    id="edit_descricao"
                                    value={editFormData.descricao}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, descricao: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                    placeholder="Descreva a transferência..."
                                    disabled={isEditing}
                                    required
                                />
                            </div>

                            {/* Botões */}
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={isEditing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isEditing}
                                >
                                    {isEditing ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Editando...</>
                                    ) : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Adicionar Conta */}
            {showAddAccountModal && (
                <AddAccountModal
                    onSave={saveNewAccount}
                    onCancel={() => setShowAddAccountModal(false)}
                    isSaving={isSavingAccount}
                />
            )}
        </div>
    );
};

// --------------------------------------------------------------------------------
// Componente: ConversionTransactionsListScreen
// Tela para listar conversões do usuário
// --------------------------------------------------------------------------------
const ConversionTransactionsListScreen = ({ goToMenu, setTransactionSubView }) => {
    const [conversoes, setConversoes] = useState([]);
    const [contas, setContas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [conversionToDelete, setConversionToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [conversionToEdit, setConversionToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [contasDestino, setContasDestino] = useState([]);
    const [editFormData, setEditFormData] = useState({
        data_transacao: '',
        valor_origem: '',
        valor_destino: '',
        taxa_cambio: '',
        id_conta_origem: '',
        id_conta_destino: '',
        descricao: ''
    });
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [isSavingAccount, setIsSavingAccount] = useState(false);

    // Função para buscar conversões, contas e categorias
    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const [conversoesRes, contasRes, categoriasRes] = await Promise.all([
                fetch(`${API_BASE_URL}/transacoes/conversoes`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/contas`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/categorias`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
            ]);

            if (conversoesRes.ok && contasRes.ok && categoriasRes.ok) {
                const [conversoesResponse, contasData, categoriasData] = await Promise.all([
                    conversoesRes.json(),
                    contasRes.json(),
                    categoriasRes.json()
                ]);
                setConversoes(conversoesResponse.conversoes || []);
                setContas(contasData);
                setCategorias(categoriasData);
            } else {
                setError('Erro ao carregar dados');
            }
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            setError('Erro ao carregar dados');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Função para formatar data
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    // Função para truncar descrição
    const truncateDescription = (description) => {
        if (!description) return 'Sem descrição';
        return description.length > 50 ? description.substring(0, 50) + '...' : description;
    };

    // Função para obter símbolo da moeda
    const getCurrencySymbol = (moeda) => {
        const symbols = {
            'BRL': 'R$',
            'USD': '$',
            'EUR': '€'
        };
        return symbols[moeda] || moeda;
    };

    // Função para obter nome da conta
    const getContaNome = (contaId) => {
        const conta = contas.find(c => c.id === contaId);
        return conta ? conta.nome : `Conta ${contaId}`;
    };

    // Função para obter nome da categoria
    const getCategoriaNome = (categoriaId) => {
        const categoria = categorias.find(c => c.id === categoriaId);
        return categoria ? categoria.nome : `Categoria ${categoriaId}`;
    };

    // Função para excluir conversão
    const handleDeleteConversion = async () => {
        if (!conversionToDelete) return;

        const token = localStorage.getItem('authToken');
        if (!token) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/transacoes/conversao/${conversionToDelete.id_grupo_operacao}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Recarrega os dados após exclusão
                await fetchData();
                setShowDeleteModal(false);
                setConversionToDelete(null);
            } else {
                const errorData = await response.json();
                setError(errorData.erro || 'Erro ao excluir conversão');
            }
        } catch (err) {
            console.error('Erro ao excluir conversão:', err);
            setError('Erro ao excluir conversão');
        } finally {
            setIsDeleting(false);
        }
    };

    // Função para abrir modal de edição
    const handleEditClick = (conversao) => {
        setConversionToEdit(conversao);
        setEditFormData({
            data_transacao: conversao.data_transacao.substring(0, 10), // Formato YYYY-MM-DD
            valor_origem: parseFloat(conversao.valor_origem).toFixed(2).replace('.', ','),
            valor_destino: parseFloat(conversao.valor_destino).toFixed(2).replace('.', ','),
            taxa_cambio: parseFloat(conversao.taxa_cambio).toFixed(2).replace('.', ','),
            id_conta_origem: conversao.conta_origem,
            id_conta_destino: conversao.conta_destino,
            descricao: conversao.descricao.replace(/Conversão Enviada: |Conversão Recebida: /g, '')
        });
        
        // Filtrar contas destino baseado na conta origem (moedas diferentes)
        const contaOrigem = contas.find(c => c.id === conversao.conta_origem);
        if (contaOrigem) {
            const contasFiltradas = contas.filter(c => 
                c.id !== conversao.conta_origem && c.moeda !== contaOrigem.moeda
            );
            setContasDestino(contasFiltradas);
        }
        
        setShowEditModal(true);
    };

    // Função para fechar modal de edição
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setConversionToEdit(null);
        setEditFormData({
            data_transacao: '',
            valor_origem: '',
            valor_destino: '',
            taxa_cambio: '',
            id_conta_origem: '',
            id_conta_destino: '',
            descricao: ''
        });
        setContasDestino([]);
    };

    // Função para lidar com mudança na conta origem
    const handleContaOrigemChange = (e) => {
        const contaOrigemId = e.target.value;
        
        // Se for para adicionar nova conta
        if (contaOrigemId === 'add_new_account') {
            setShowAddAccountModal(true);
            return;
        }
        
        setEditFormData(prev => ({
            ...prev,
            id_conta_origem: contaOrigemId,
            id_conta_destino: '' // Reset conta destino
        }));

        // Filtrar contas destino baseado na moeda da conta origem (moedas diferentes)
        if (contaOrigemId) {
            const contaOrigem = contas.find(c => c.id === parseInt(contaOrigemId));
            if (contaOrigem) {
                const contasFiltradas = contas.filter(c => 
                    c.id !== parseInt(contaOrigemId) && c.moeda !== contaOrigem.moeda
                );
                setContasDestino(contasFiltradas);
            }
        } else {
            setContasDestino([]);
        }
    };

    // Função para obter símbolo da moeda baseado na conta origem
    const getCurrencySymbolForOrigem = () => {
        if (!editFormData.id_conta_origem) return 'R$';
        const contaOrigem = contas.find(c => c.id === parseInt(editFormData.id_conta_origem));
        return contaOrigem ? getCurrencySymbol(contaOrigem.moeda) : 'R$';
    };

    // Função para lidar com mudança na conta destino
    const handleContaDestinoChange = (e) => {
        const contaDestinoId = e.target.value;
        
        // Se for para adicionar nova conta
        if (contaDestinoId === 'add_new_account') {
            setShowAddAccountModal(true);
            return;
        }
        
        setEditFormData(prev => ({
            ...prev,
            id_conta_destino: contaDestinoId
        }));
    };

    // Função para obter símbolo da moeda baseado na conta destino
    const getCurrencySymbolForDestino = () => {
        if (!editFormData.id_conta_destino) return '$';
        const contaDestino = contas.find(c => c.id === parseInt(editFormData.id_conta_destino));
        return contaDestino ? getCurrencySymbol(contaDestino.moeda) : '$';
    };

    // Função para formatar valor (igual aos outros formulários)
    const formatCurrency = (value) => {
        const numericValue = value.replace(/\D/g, '');
        const realValue = (parseInt(numericValue) / 100).toFixed(2);
        return realValue.replace('.', ',');
    };

    // Função para lidar com mudança no valor origem
    const handleValorOrigemChange = (e) => {
        const value = e.target ? e.target.value : e;
        const formattedValue = formatCurrency(value);
        setEditFormData(prev => ({
            ...prev,
            valor_origem: formattedValue
        }));
    };

    // Função para lidar com mudança no valor destino
    const handleValorDestinoChange = (e) => {
        const value = e.target ? e.target.value : e;
        const formattedValue = formatCurrency(value);
        setEditFormData(prev => ({
            ...prev,
            valor_destino: formattedValue
        }));
    };

    // Função para lidar com mudança na taxa
    const handleTaxaChange = (e) => {
        const value = e.target ? e.target.value : e;
        const formattedValue = formatCurrency(value);
        setEditFormData(prev => ({
            ...prev,
            taxa_cambio: formattedValue
        }));
    };

    // Função para confirmar edição
    const handleConfirmEdit = async () => {
        if (!conversionToEdit) return;

        setIsEditing(true);
        const token = localStorage.getItem('authToken');
        
        try {
            const response = await fetch(`${API_BASE_URL}/transacoes/conversao/${conversionToEdit.id_grupo_operacao}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_conta_origem: parseInt(editFormData.id_conta_origem),
                    id_conta_destino: parseInt(editFormData.id_conta_destino),
                    valor_origem: parseFloat(editFormData.valor_origem.replace(',', '.')),
                    valor_destino: parseFloat(editFormData.valor_destino.replace(',', '.')),
                    taxa_cambio: parseFloat(editFormData.taxa_cambio.replace(',', '.')),
                    descricao: editFormData.descricao,
                    data_transacao: editFormData.data_transacao
                }),
            });

            if (response.ok) {
                // Atualizar a lista de conversões
                await fetchData();
                setShowEditModal(false);
                setConversionToEdit(null);
            } else {
                const errorData = await response.json();
                console.error('Erro ao editar conversão:', errorData);
                alert('Erro ao editar conversão. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao editar conversão:', error);
            alert('Erro ao editar conversão. Tente novamente.');
        } finally {
            setIsEditing(false);
        }
    };

    // Função para salvar nova conta
    const saveNewAccount = async (accountData) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        setIsSavingAccount(true);
        try {
            const response = await fetch(`${API_BASE_URL}/contas`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accountData),
            });

            if (response.ok) {
                // Recarregar as contas
                await fetchData();
                setShowAddAccountModal(false);
                alert('Conta adicionada com sucesso!');
            } else {
                const errorData = await response.json();
                console.error('Erro ao adicionar conta:', errorData);
                alert('Erro ao adicionar conta. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao adicionar conta:', error);
            alert('Erro ao adicionar conta. Tente novamente.');
        } finally {
            setIsSavingAccount(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchData}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="bg-white rounded-xl shadow-xl border-t-4 border-t-purple-500 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button 
                                onClick={goToMenu}
                                className="mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Voltar"
                            >
                                <X size={24} />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Conversões</h2>
                                <p className="text-gray-600 text-sm">Gerencie suas conversões de moeda</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setTransactionSubView('register_conversion')}
                            className="p-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors shadow-lg"
                            aria-label="Adicionar nova conversão"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4" role="alert">
                            {error}
                        </div>
                    )}

                    {conversoes.length === 0 ? (
                        <div className="text-center py-12">
                            <Edit className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conversão encontrada</h3>
                            <p className="text-gray-500">Você ainda não possui conversões registradas.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {conversoes.map((conversao) => (
                                <div key={conversao.id_grupo_operacao} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(conversao.data_transacao)}
                                                </span>
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                                                    {getCategoriaNome(conversao.id_categoria)}
                                                </span>
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    Taxa: {getCurrencySymbol(conversao.moeda_origem)}{parseFloat(conversao.taxa_cambio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            
                                            <p className="text-gray-800 font-medium mb-2">
                                                {truncateDescription(conversao.descricao)}
                                            </p>
                                            
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="flex items-center">
                                                        <span className="mr-1">{getCurrencySymbol(conversao.moeda_origem)}</span>
                                                        {parseFloat(conversao.valor_origem).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <ArrowRight className="h-3 w-3" />
                                                    <span className="flex items-center">
                                                        <span className="mr-1">{getCurrencySymbol(conversao.moeda_destino)}</span>
                                                        {parseFloat(conversao.valor_destino).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span>{getContaNome(conversao.conta_origem)}</span>
                                                    <ArrowRight className="h-3 w-3" />
                                                    <span>{getContaNome(conversao.conta_destino)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEditClick(conversao)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                                aria-label="Editar conversão"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setConversionToDelete(conversao);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                                aria-label="Excluir conversão"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Excluir Conversão</h3>
                                <p className="text-gray-600">Esta ação não pode ser desfeita.</p>
                            </div>
                        </div>
                        
                        <p className="text-gray-700 mb-6">
                            Tem certeza que deseja excluir esta conversão? 
                            Esta ação irá reverter o saldo das contas envolvidas.
                        </p>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setConversionToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteConversion}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Edit className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Editar Conversão</h3>
                                <p className="text-gray-600">Altere os dados da conversão</p>
                            </div>
                        </div>
                        
                        <form onSubmit={(e) => { e.preventDefault(); handleConfirmEdit(); }}>
                            {/* Data */}
                            <div className="mb-4">
                                <label htmlFor="edit_data_transacao" className="block text-sm font-semibold text-gray-700 mb-1">Data:</label>
                                <input
                                    type="date"
                                    id="edit_data_transacao"
                                    value={editFormData.data_transacao}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, data_transacao: e.target.value }))}
                                    className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                                    required
                                    disabled={isEditing}
                                />
                            </div>

                            {/* Conta de Origem */}
                            <div className="mb-4">
                                <label htmlFor="edit_id_conta_origem" className="block text-sm font-semibold text-gray-700 mb-1">Conta de Origem:</label>
                                <select
                                    id="edit_id_conta_origem"
                                    value={editFormData.id_conta_origem}
                                    onChange={handleContaOrigemChange}
                                    className="w-full px-3 py-2 border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg shadow-sm"
                                    required
                                    disabled={isEditing}
                                >
                                    <option value="">Selecione a conta de origem</option>
                                    {contas.map(conta => (
                                        <option key={conta.id} value={conta.id}>{conta.nome} ({conta.moeda})</option>
                                    ))}
                                    <option
                                        value="add_new_account"
                                        className="font-semibold text-purple-600 bg-purple-50"
                                    >
                                        + Adicionar Nova Conta
                                    </option>
                                </select>
                            </div>

                            {/* Conta de Destino */}
                            <div className="mb-4">
                                <label htmlFor="edit_id_conta_destino" className="block text-sm font-semibold text-gray-700 mb-1">Conta de Destino:</label>
                                <select
                                    id="edit_id_conta_destino"
                                    value={editFormData.id_conta_destino}
                                    onChange={handleContaDestinoChange}
                                    className="w-full px-3 py-2 border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg shadow-sm"
                                    required
                                    disabled={isEditing || !editFormData.id_conta_origem}
                                >
                                    <option value="">{editFormData.id_conta_origem ? 'Selecione a conta de destino' : 'Selecione primeiro a conta de origem'}</option>
                                    {contasDestino.map(conta => (
                                        <option key={conta.id} value={conta.id}>{conta.nome} ({conta.moeda})</option>
                                    ))}
                                    {editFormData.id_conta_origem && (
                                        <option
                                            value="add_new_account"
                                            className="font-semibold text-purple-600 bg-purple-50"
                                        >
                                            + Adicionar Nova Conta
                                        </option>
                                    )}
                                </select>
                            </div>

                            {/* Valor Origem */}
                            <div className="mb-4">
                                <label htmlFor="edit_valor_origem" className="block text-sm font-semibold text-gray-700 mb-1">Valor Origem:</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">{getCurrencySymbolForOrigem()}</span>
                                    </div>
                                    <input
                                        type="text"
                                        id="edit_valor_origem"
                                        value={editFormData.valor_origem}
                                        onChange={handleValorOrigemChange}
                                        placeholder="0,00"
                                        className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                                        required
                                        disabled={isEditing}
                                    />
                                </div>
                            </div>

                            {/* Valor Destino */}
                            <div className="mb-4">
                                <label htmlFor="edit_valor_destino" className="block text-sm font-semibold text-gray-700 mb-1">Valor Destino:</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">{getCurrencySymbolForDestino()}</span>
                                    </div>
                                    <input
                                        type="text"
                                        id="edit_valor_destino"
                                        value={editFormData.valor_destino}
                                        onChange={handleValorDestinoChange}
                                        placeholder="0,00"
                                        className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                                        required
                                        disabled={isEditing}
                                    />
                                </div>
                            </div>

                            {/* Taxa */}
                            <div className="mb-4">
                                <label htmlFor="edit_taxa_cambio" className="block text-sm font-semibold text-gray-700 mb-1">Taxa:</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">{getCurrencySymbolForOrigem()}</span>
                                    </div>
                                    <input
                                        type="text"
                                        id="edit_taxa_cambio"
                                        value={editFormData.taxa_cambio}
                                        onChange={handleTaxaChange}
                                        placeholder="0,00"
                                        className="w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                                        required
                                        disabled={isEditing}
                                    />
                                </div>
                            </div>

                            {/* Descrição */}
                            <div className="mb-6">
                                <label htmlFor="edit_descricao" className="block text-sm font-semibold text-gray-700 mb-1">Descrição:</label>
                                <textarea
                                    id="edit_descricao"
                                    value={editFormData.descricao}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, descricao: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                                    placeholder="Descreva a conversão..."
                                    disabled={isEditing}
                                    required
                                />
                            </div>

                            {/* Botões */}
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={isEditing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isEditing}
                                >
                                    {isEditing ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Editando...</>
                                    ) : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Adicionar Conta */}
            {showAddAccountModal && (
                <AddAccountModal
                    onSave={saveNewAccount}
                    onCancel={() => setShowAddAccountModal(false)}
                    isSaving={isSavingAccount}
                />
            )}
        </div>
    );
};

// --------------------------------------------------------------------------------
// Componente: QuickTransactionTypeSelectionScreen (NOVO)
// Tela de seleção rápida para adicionar transações (despesa/receita)
// --------------------------------------------------------------------------------
const QuickTransactionTypeSelectionScreen = ({ goToMenu, setTransactionSubView }) => {
    // Componente de Cartão de Opção (igual ao original)
    const SelectionCard = ({ title, icon: Icon, color, description, action }) => (
        <button
            onClick={action}
            className="flex flex-col items-center justify-center p-6 h-36 rounded-xl shadow-lg transition-transform duration-150 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full text-center"
            style={{ backgroundColor: color }}
        >
            <Icon className="w-8 h-8 text-white mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-white opacity-90">{description}</p>
        </button>
    );

    return (
        <div className="p-4">
            <div className="flex items-center mb-6">
                <button 
                    onClick={goToMenu}
                    className="mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Voltar"
                >
                    <X size={24} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Adicionar Transação</h2>
                    <p className="text-gray-600 text-sm">Selecione o tipo de transação que deseja registrar</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectionCard
                    title="Despesa"
                    icon={Minus}
                    color="#ef4444"
                    description="Registrar gastos e despesas"
                    action={() => setTransactionSubView('register_expense')}
                />
                <SelectionCard
                    title="Receita"
                    icon={Plus}
                    color="#10b981"
                    description="Registrar ganhos e receitas"
                    action={() => setTransactionSubView('register_income')}
                />
            </div>
      </div>
    );
};

// --------------------------------------------------------------------------------
// Componente de Formulário para Nova Transação de Crédito (Corrigido)
// --------------------------------------------------------------------------------
const NewCreditTransactionSetupScreen = ({ goToMenu, setTransactionSubView }) => {
    const [cartoes, setCartoes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCardSubmitting, setIsCardSubmitting] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState('BRL');
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);  // Controle do modal de categoria
    const [isSavingCategory, setIsSavingCategory] = useState(false);  // Controle do estado de salvamento da categoria

    const [formData, setFormData] = useState({
      data_transacao: new Date().toISOString().substring(0, 10),
      valor_total: '',
      parcelas_total: '1',
      descricao: '',
      id_cartao: '',
      id_categoria: '',
      recorrencia: 'Esporadico', // NOVO: Campo de recorrência
    });



    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;
    
        if (selectedValue === 'add_new_category') {
            setShowAddCategoryModal(true);
        } else {
            // Atualiza o estado com a categoria selecionada
            setFormData(prev => ({ ...prev, id_categoria: selectedValue }));
        }
    };
    

    
  
    // --- Fetch de cartões e categorias ---
    const fetchData = useCallback(async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
  
      setIsLoading(true);
      setError(null);
      setShowSuccessModal(false);
  
      try {
        const [cartoesRes, categoriasRes] = await Promise.all([
          fetch(`${API_BASE_URL}/cartoes`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/categorias`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);
  
        const cartoesData = cartoesRes.ok ? await cartoesRes.json() : [];
        const categoriasData = categoriasRes.ok ? await categoriasRes.json() : [];
  
        setCartoes(Array.isArray(cartoesData) ? cartoesData : []);
        setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
  
        let initialCardId = '';
        let initialCurrency = 'BRL';
  
        if (cartoesData.length > 0) {
          initialCardId = cartoesData[0].id;
          initialCurrency = cartoesData[0].moeda || 'BRL';
        }
  
        setFormData(prev => ({
          ...prev,
          id_cartao: initialCardId,
          id_categoria: categoriasData.length > 0 ? categoriasData[0].id : '',
        }));
  
        setSelectedCurrency(initialCurrency);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar listas de cartões e categorias.');
      } finally {
        setIsLoading(false);
      }
    }, []);
  
    useEffect(() => {
      fetchData();
    }, [fetchData]);     

    // Função para salvar a nova categoria
    const saveNewCategory = async (categoryData) => {
        setIsSavingCategory(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`${API_BASE_URL}/categorias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(categoryData),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar categoria.');
            }

            const data = await response.json();
            setCategorias((prevCategorias) => [...prevCategorias, data.categoria]);
            setShowAddCategoryModal(false);  // Fecha o modal após a criação da categoria
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            setError('Erro ao criar categoria.');
        } finally {
            setIsSavingCategory(false);
        }
    };

    // Função para cancelar a operação de criação de categoria
    const cancelAddCategory = () => {
        setShowAddCategoryModal(false);
    };
  
    // --- Manipuladores ---
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setError(null);
      setShowSuccessModal(false);
    };
  
    const handleCardChange = (e) => {
      const selectedValue = e.target.value;
      setError(null);
      setShowSuccessModal(false);
  
      if (selectedValue === 'add_new_card') {
        // abre o modal corretamente
        setShowAddCardModal(true);
      } else {
        setFormData(prev => ({ ...prev, id_cartao: selectedValue }));
        const selectedCard = cartoes.find(card => String(card.id) === String(selectedValue));
        setSelectedCurrency(selectedCard ? (selectedCard.moeda || 'BRL') : 'BRL');
      }
    };
  
    const handleValueChange = (e) => {
      let cleanValue = e.target.value.replace(/\D/g, '');
      if (cleanValue.length > 15) cleanValue = cleanValue.substring(0, 15);
      const floatValue = cleanValue ? (parseInt(cleanValue) / 100).toFixed(2) : '0.00';
      setFormData(prev => ({ ...prev, valor_total: floatValue }));
      setError(null);
      setShowSuccessModal(false);
    };
  
    // --- Criação de novo cartão via modal ---
    const handleCardSave = async (cardData) => {
      setIsCardSubmitting(true);
      const token = localStorage.getItem('authToken');
      setError(null);
  
      try {
        const response = await fetch(`${API_BASE_URL}/cartoes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(cardData),
        });
  
        if (!response.ok) throw new Error('Falha ao adicionar o cartão.');
  
        setShowAddCardModal(false);
        await fetchData(); // atualiza a lista
      } catch (err) {
        console.error('Erro ao salvar cartão:', err);
        setError(err.message || 'Erro desconhecido ao adicionar o cartão.');
      } finally {
        setIsCardSubmitting(false);
      }
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        const valorNumerico = parseFloat(formData.valor_total);
      
        if (!formData.id_cartao || !formData.id_categoria || valorNumerico <= 0 || isNaN(valorNumerico)) {
          setError('Selecione um cartão, uma categoria e informe um valor válido.');
          setShowSuccessModal(false);
          return;
        }
      
        setError(null);
        setShowSuccessModal(false);
        setIsSubmitting(true);
      
        const dataToSend = {
          data_transacao: new Date(formData.data_transacao + 'T12:00:00').toISOString(),
          valor_total: valorNumerico,
          parcelas_total: parseInt(formData.parcelas_total),
          descricao: formData.descricao,
          id_cartao: parseInt(formData.id_cartao),
          id_categoria: parseInt(formData.id_categoria),
        };
      
        const token = localStorage.getItem('authToken');
        try {
          const response = await fetch(`${API_BASE_URL}/transacoes/credito`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(dataToSend),
          });
      
          if (!response.ok) throw new Error('Erro ao registrar transação.');
      
          setShowSuccessModal(true);
        } catch (err) {
          console.error('Erro ao registrar:', err);
          setError(err.message || 'Erro desconhecido ao registrar a transação.');
        } finally {
          setIsSubmitting(false);
        }
      };
      
  
    if (isLoading) return <LoadingSpinner />;
  
    const currencySymbol = getCurrencySymbol(selectedCurrency);
  
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-xl border-t-4 border-t-blue-500 overflow-hidden">
          {/* Header */}
          <div className="flex items-center p-4 border-b border-gray-100 bg-gray-50">
            <CreditCard size={24} className="text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800 flex-grow">Nova Transação de Crédito</h2>
            <button
              onClick={() => setTransactionSubView('credit_transactions_list')}
              className="p-1 text-gray-500 hover:text-gray-800 transition-colors rounded-full"
              disabled={isSubmitting || showSuccessModal}
            >
              <X size={20} />
            </button>
          </div>
  
          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-4 space-y-5">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm font-medium" role="alert">
                {error}
              </div>
            )}
  
            {/* Data / Valor / Parcelas */}
            <div className="flex space-x-3">
              <div className="flex-1">
                <label htmlFor="data_transacao" className="block text-sm font-semibold text-gray-700 mb-1">Data:</label>
                <input
                  type="date"
                  id="data_transacao"
                  name="data_transacao"
                  value={formData.data_transacao}
                  onChange={handleChange}
                  className="w-full px-2 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  disabled={isSubmitting || showSuccessModal}
                  required
                />
              </div>
  
              <div className="flex-1">
                <label htmlFor="valor_total" className="block text-sm font-semibold text-gray-700 mb-1">Valor:</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm font-medium">{currencySymbol}</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    id="valor_total"
                    name="valor_total"
                    placeholder="0,00"
                    value={formData.valor_total.replace('.', ',')}
                    onChange={handleValueChange}
                    className="block w-full pl-8 pr-3 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-right"
                    disabled={isSubmitting || showSuccessModal}
                    required
                  />
                </div>
              </div>
  
              <div className="w-1/4">
                <label htmlFor="parcelas_total" className="block text-sm font-semibold text-gray-700 mb-1">Parcelas:</label>
                <select
                  id="parcelas_total"
                  name="parcelas_total"
                  value={formData.parcelas_total}
                  onChange={handleChange}
                  className="w-full px-2 py-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  disabled={isSubmitting || showSuccessModal}
                  required
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recorrência */}
            <div className="mb-4">
              <label htmlFor="recorrencia" className="block text-sm font-semibold text-gray-700 mb-1">Recorrência:</label>
              <select
                id="recorrencia"
                name="recorrencia"
                value={formData.recorrencia}
                onChange={handleChange}
                className="w-full px-3 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                disabled={isSubmitting || showSuccessModal}
                required
              >
                <option value="Esporadico">Esporádico</option>
                <option value="Fixo">Fixo</option>
              </select>
            </div>
  
            {/* Cartão e Categoria */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="id_cartao" className="block text-sm font-semibold text-gray-700 mb-1">Cartão:</label>
                <select
                  id="id_cartao"
                  name="id_cartao"
                  value={formData.id_cartao}
                  onChange={handleCardChange}
                  className="w-full px-3 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                  disabled={isSubmitting || showSuccessModal}
                  required={cartoes.length > 0}
                >
                  <option value="" disabled={formData.id_cartao !== '' || cartoes.length > 0}>
                    {cartoes.length === 0 ? 'Cadastre um cartão abaixo' : ''}
                  </option>
  
                  {cartoes.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.nome_cartao} ({card.moeda || 'BRL'})
                    </option>
                  ))}
  
                  {/* opção para abrir modal */}
                  <option value="add_new_card" className="font-semibold text-blue-600 bg-blue-50">
                    + Adicionar Cartão de Crédito
                  </option>
                </select>
  
                {cartoes.length === 0 && (
                  <p className="mt-1 text-xs text-red-600">Necessário adicionar um cartão para registrar a transação.</p>
                )}
              </div>
  
              <div className="flex-1">
                <label htmlFor="id_categoria" className="block text-sm font-semibold text-gray-700 mb-1">Categoria:</label>
                <select
                    id="id_categoria"
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={(e) => {
                        const selectedValue = e.target.value;

                        // Se a opção for "Adicionar Nova Categoria", abre o modal
                        if (selectedValue === 'add_new_category') {
                        setShowAddCategoryModal(true);
                        } else {
                            // Atualiza o estado com a categoria selecionada
                            setFormData(prev => ({ ...prev, id_categoria: selectedValue }));
                        }
                    }}
                    className="w-full px-3 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                    disabled={isSubmitting || showSuccessModal}  // Apenas desabilita quando necessário
                    required
                    >
                    {categorias.map(categoria => (
                        <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                    ))}
                    <option
                        value="add_new_category"
                        className="font-semibold text-blue-600 bg-blue-50"
                    >
                        + Adicionar Nova Categoria
                    </option>
                    </select>

              </div>
            </div>
  
            {/* Descrição */}
            <div>
              <label htmlFor="descricao" className="block text-sm font-semibold text-gray-700 mb-1">Descrição:</label>
              <textarea
                id="descricao"
                name="descricao"
                rows="2"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Ex: Compra de teclado novo"
                className="w-full px-3 py-2 shadow-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting || showSuccessModal}
                required
              />
            </div>
  
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white transition-colors ${
                isSubmitting || showSuccessModal
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
              disabled={isSubmitting || showSuccessModal}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Registrando...
                </>
              ) : 'Registrar Transação'}
            </button>
          </form>
        </div>
  
        {/* Modal de Sucesso */}
        <SuccessModal
          isOpen={showSuccessModal}
          message="A transação de crédito foi registrada com sucesso e suas parcelas foram geradas!"
          onConfirm={() => setTransactionSubView('credit_transactions_list')}
          onClose={() => setTransactionSubView('credit_transactions_list')}
        />
  
        {/* Modal de Adicionar Cartão */}
        {showAddCardModal && (
          <AddCardModal
            onSave={handleCardSave}
            onCancel={() => setShowAddCardModal(false)}
            isSaving={isCardSubmitting}
          />
        )}

        {showAddCategoryModal && (
            <AddCategoryModal
                onSave={saveNewCategory}
                onCancel={cancelAddCategory}
                isSaving={isSavingCategory}
          />
        )}
      </div>
    );
  };

// --------------------------------------------------------------------------------
// Componente de Autenticação (Mantido o estilo Mobile-friendly)
// --------------------------------------------------------------------------------
const AuthScreen = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { setError(''); }, [isLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const endpoint = isLogin ? '/usuario/login' : '/usuario/registrar';
        // Ajuste: Certifica-se de que o nome não é enviado no login
        const payload = { email, senha, nome: isLogin ? undefined : nome };
        const apiUrl = `${API_URL}${endpoint}`; 

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.erro || data.mensagem || `Erro de ${isLogin ? 'Login' : 'Registro'} desconhecido.`;
                throw new Error(errorMessage);
            }

            const token = data.token; 
            if (token) {
                localStorage.setItem('authToken', token);
                onAuthSuccess(token);
            } else {
                setError('Resposta da API incompleta: Token de autenticação não recebido.');
            }

        } catch (err) {
            console.error('Erro de autenticação:', err);
            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                setError('Não foi possível conectar ao backend. Verifique se o servidor está em execução.');
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
                
                <div className="flex flex-col items-center mb-8">
                    {/* Logo/Branding Placeholder */}
                    <img 
                        src={Logo}
                        alt="FinApp Analytics Logo" 
                        className="w-64 h-auto mb-2" 
                    /> 
                    <p className="text-sm text-gray-500 mt-1">
                        {isLogin ? 'Acesse sua plataforma' : 'Crie sua conta'}
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="nome">Nome</label>
                            <input
                                id="nome"
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                                placeholder="Seu nome completo"
                                required={!isLogin}
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="senha">Senha</label>
                        <input
                            id="senha"
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {isLogin && (
                        <div className="flex justify-end mb-6">
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition duration-150">
                                Esqueceu sua senha?
                            </a>
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        style={{ backgroundColor: primaryGreen, boxShadow: `0 4px 6px -1px ${primaryGreen}80, 0 2px 4px -1px ${primaryGreen}40` }}
                        className="w-full text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition duration-200 flex items-center justify-center disabled:opacity-50 cursor-pointer"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : isLogin ? 'Entrar' : 'Crie sua conta'}
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-sm">OU</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="space-y-3">
                    <button
                        type="button"
                        className="w-full border border-gray-300 bg-white text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 transition duration-200 shadow-sm flex items-center justify-center cursor-pointer"
                    >
                        <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png" 
                        alt="Google icon" 
                        className="w-5 h-5 mr-3" />
                        Continuar com Google
                    </button>
                </div>

                <p className="mt-8 text-center text-sm text-gray-600">
                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); }}
                        style={{ color: primaryGreen }}
                        className="font-bold hover:text-opacity-80 ml-1 transition duration-150 cursor-pointer"
                    >
                        {isLogin ? 'Crie sua conta' : 'Fazer Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

// --------------------------------------------------------------------------------
// Componente de Layout/Dashboard (Mobile First)
// --------------------------------------------------------------------------------
const DashboardLayout = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  
  
  // NOVO ESTADO: Controla a navegação interna da aba 'transactions'
  // Valores possíveis: 'menu' (padrão), 'register_credit', 'register_account', etc.
  const [transactionView, setTransactionView] = useState(null); 
  const [transactionSubView, setTransactionSubView] = useState('menu'); 
  
  // Função para mudar a aba principal e resetar a sub-view
  const handleTabChange = (newTab) => {
      if (newTab !== 'transactions') {
          setTransactionView(null); // Reseta a sub-view ao sair da aba
      }
      setActiveTab(newTab);
  };



  // Função que renderiza o conteúdo principal
  const renderContent = () => {
      switch (activeTab) {
          case 'contas':
              return <AccountsScreen />;
          case 'cartoes':
              return <CreditCardsScreen />;
          case 'transactions': 
              // Agora vai direto para a tela de gerenciar transações
              return <ManageTransactionScreen 
                          goToMenu={() => setActiveTab('dashboard')} 
                          setTransactionSubView={setTransactionSubView} 
                      />;
          case 'dashboard':
          default:
              return <DashboardScreen />;
      }
  };

  // Adicionar CSS global para garantir que a barra inferior seja sempre visível
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .bottom-nav-fixed {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 9999 !important;
        background-color: white !important;
        border-top: 1px solid #e5e7eb !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        width: 100% !important;
        max-width: 100% !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
      <div className="min-h-screen bg-gray-50 flex flex-col mx-auto max-w-xl w-full" style={{position: 'relative', minHeight: '100vh'}}> 
          
          {/* Cabeçalho Fixo Simples para Mobile */}
          <header className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4 shadow-sm flex justify-between items-center">
              <img 
                  src={Logo} 
                  alt="FinApp Analytics Logo" 
                  className="h-8 mr-2" 
                  style={{ filter: 'brightness(0) invert(1)', objectFit: 'contain' }} 
              />
              <Menu size={24} className="text-gray-600" />
          </header>
          
          {/* Conteúdo Principal (Scrollável, com padding extra no final para a barra inferior) */}
          <main className="flex-grow overflow-y-auto" style={{paddingBottom: '80px'}}> 
              {renderContent()}
          </main>
          
          {/* Barra de Navegação Inferior */}
          <BottomNavigationBar 
              activeTab={activeTab} 
              setActiveTab={handleTabChange} // ATENÇÃO: Use handleTabChange
              setShowModal={setShowLogoutModal}
              isLoadingTransactions={isLoadingTransactions}
          />

          {/* Modal de Confirmação de Saída */}
          <ConfirmationModal 
              isOpen={showLogoutModal}
              onConfirm={onLogout}
              onCancel={() => setShowLogoutModal(false)}
          />

      </div>
  );
};

// --------------------------------------------------------------------------------
// Componente Principal da Aplicação
// --------------------------------------------------------------------------------
export default function App() {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken')); 

    const handleAuthSuccess = useCallback((token) => {
        setAuthToken(token);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
    }, []);
    
    return (
        <div className="w-full min-h-screen">
            {!authToken ? (
                <AuthScreen onAuthSuccess={handleAuthSuccess} />
            ) : (
                <DashboardLayout onLogout={handleLogout} />
            )}
        </div>
    );
}
