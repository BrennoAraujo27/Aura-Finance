/**
 * AURA FINANCE - CORE APPLICATION LOGIC (ES6)
 * Sistema de Controle Financeiro Pessoal Inteligente
 */

// =============================================================================
// 1. DEFAULT DATASET & STORE CONFIGURATION
// =============================================================================
const DEFAULT_FINANCIAL_STATE = {
  user: {
    name: 'Mariana Araujo',
    avatar: 'MA',
    monthlyGrossIncome: 11200.00,
    monthlyNetIncome: 8500.00,
    workHoursPerMonth: 160, // R$ 53,12 / hora
    hourlyWage: 53.12,
    hideValues: false,
    viewMode: 'mobile', // 'mobile' | 'desktop'
    geminiApiKey: ''
  },
  accounts: [
    { id: 'acc_nu', name: 'Nubank', type: 'CHECKING', balance: 3420.00, dotClass: 'nu' },
    { id: 'acc_itau', name: 'Itaú Card', type: 'CREDIT_CARD', balance: -2450.00, creditLimit: 15000.00, dotClass: 'itau' },
    { id: 'acc_inter', name: 'Inter Invest', type: 'INVESTMENT', balance: 18500.00, dotClass: 'inter' }
  ],
  transactions: [
    {
      id: 'tx_1',
      description: 'Supermercado Pão de Açúcar',
      cleanMerchant: 'Pão de Açúcar',
      amount: -412.50,
      direction: 'OUTFLOW',
      category: 'needs_supermarket',
      categoryLabel: 'Mercado',
      budgetRule: 'NEEDS_50',
      account: 'Nubank',
      method: 'DEBIT_CARD',
      date: '2026-10-22T11:20:00Z',
      icon: '🛒'
    },
    {
      id: 'tx_2',
      description: 'iFood *Restaurante Mania',
      cleanMerchant: 'iFood',
      amount: -68.90,
      direction: 'OUTFLOW',
      category: 'wants_delivery',
      categoryLabel: 'Delivery',
      budgetRule: 'WANTS_30',
      account: 'Itaú Card',
      method: 'CREDIT_CARD',
      date: '2026-10-21T20:15:00Z',
      icon: '🍔'
    },
    {
      id: 'tx_3',
      description: 'Salário Tech Corp Brasil',
      cleanMerchant: 'Tech Corp',
      amount: 8500.00,
      direction: 'INFLOW',
      category: 'salary_income',
      categoryLabel: 'Salário Líquido',
      budgetRule: 'INFLOW',
      account: 'Nubank',
      method: 'TED',
      date: '2026-10-05T09:00:00Z',
      icon: '💼'
    },
    {
      id: 'tx_4',
      description: 'QuintoAndar Aluguel + Cond',
      cleanMerchant: 'QuintoAndar',
      amount: -2650.00,
      direction: 'OUTFLOW',
      category: 'needs_housing',
      categoryLabel: 'Moradia',
      budgetRule: 'NEEDS_50',
      account: 'Nubank',
      method: 'BOLETO',
      date: '2026-10-10T14:00:00Z',
      icon: '🏠'
    },
    {
      id: 'tx_5',
      description: 'Aporte Tesouro Selic 2029',
      cleanMerchant: 'Tesouro Direto',
      amount: -1500.00,
      direction: 'OUTFLOW',
      category: 'savings_reserve',
      categoryLabel: 'Reserva & Aportes',
      budgetRule: 'SAVINGS_20',
      account: 'Inter Invest',
      method: 'PIX',
      date: '2026-10-06T10:30:00Z',
      icon: '📈'
    },
    {
      id: 'tx_6',
      description: 'Uber *Trips Sao Paulo',
      cleanMerchant: 'Uber',
      amount: -34.80,
      direction: 'OUTFLOW',
      category: 'wants_delivery',
      categoryLabel: 'Transporte App',
      budgetRule: 'WANTS_30',
      account: 'Itaú Card',
      method: 'CREDIT_CARD',
      date: '2026-10-20T18:40:00Z',
      icon: '🚗'
    },
    {
      id: 'tx_7',
      description: 'Droga Raia Medicamentos',
      cleanMerchant: 'Droga Raia',
      amount: -118.20,
      direction: 'OUTFLOW',
      category: 'needs_health',
      categoryLabel: 'Saúde',
      budgetRule: 'NEEDS_50',
      account: 'Nubank',
      method: 'DEBIT_CARD',
      date: '2026-10-18T16:10:00Z',
      icon: '💊'
    },
    {
      id: 'tx_8',
      description: 'Projeto UI Freelance',
      cleanMerchant: 'Cliente Design',
      amount: 1350.00,
      direction: 'INFLOW',
      category: 'freelance_income',
      categoryLabel: 'Freelance',
      budgetRule: 'INFLOW',
      account: 'Nubank',
      method: 'PIX',
      date: '2026-10-15T15:00:00Z',
      icon: '✨'
    }
  ],
  categories: [
    { id: 'needs_housing', name: 'Moradia & Contas', color: '#3B82F6', icon: '🏠', rule: 'NEEDS_50', spent: 2650.00, limit: 2800.00 },
    { id: 'needs_supermarket', name: 'Alimentação & Mercado', color: '#60A5FA', icon: '🛒', rule: 'NEEDS_50', spent: 1250.00, limit: 1600.00 },
    { id: 'needs_health', name: 'Saúde & Farmácia', color: '#93C5FD', icon: '💊', rule: 'NEEDS_50', spent: 197.00, limit: 400.00 },
    { id: 'wants_delivery', name: 'Delivery, Bares & Lazer', color: '#A855F7', icon: '🍔', rule: 'WANTS_30', spent: 1280.00, limit: 1300.00 },
    { id: 'wants_shopping', name: 'Compras & Vestuário', color: '#C084FC', icon: '🛍️', rule: 'WANTS_30', spent: 650.00, limit: 800.00 },
    { id: 'wants_entertainment', name: 'Streamings & Apps', color: '#E879F9', icon: '🎬', rule: 'WANTS_30', spent: 407.00, limit: 450.00 },
    { id: 'savings_reserve', name: 'Investimentos & Metas', color: '#00F090', icon: '🚀', rule: 'SAVINGS_20', spent: 2065.00, limit: 1700.00 }
  ],
  leaks: [
    {
      id: 'leak_gym',
      title: 'Smart Fit Academia (Não utilizada)',
      frequency: 'Mensal',
      costMonthly: 149.90,
      costAnnual: 1798.80,
      note: 'Sem check-in nos últimos 42 dias'
    },
    {
      id: 'leak_coffee',
      title: 'Café Expresso de Rua (Microgasto diário)',
      frequency: 'Diário útil (22x/mês)',
      costMonthly: 264.00,
      costAnnual: 3168.00,
      note: 'Média de R$ 12,00 por dia útil'
    },
    {
      id: 'leak_streaming',
      title: 'Streaming de Vídeo Secundário',
      frequency: 'Mensal',
      costMonthly: 55.90,
      costAnnual: 670.80,
      note: 'Apenas 1 hora de reprodução no mês'
    }
  ],
  goals: [
    {
      id: 'goal_emergency',
      title: 'Reserva de Emergência (6 Meses)',
      currentAmount: 18500.00,
      targetAmount: 30000.00,
      deadline: 'Dezembro 2026',
      icon: '🛡️',
      color: '#00F090'
    },
    {
      id: 'goal_trip',
      title: 'Viagem Europa 2027',
      currentAmount: 4200.00,
      targetAmount: 15000.00,
      deadline: 'Julho 2027',
      icon: '✈️',
      color: '#00D2FF'
    },
    {
      id: 'goal_tech',
      title: 'Upgrade MacBook Pro M-Chip',
      currentAmount: 6800.00,
      targetAmount: 12000.00,
      deadline: 'Março 2027',
      icon: '💻',
      color: '#9D4EDD'
    }
  ],
  challenges: [
    {
      id: 'ch_delivery',
      title: 'Semana Sem Delivery',
      desc: 'Cozinhe em casa de segunda a sexta',
      progressDays: '4/5 dias',
      badge: 'Chef Consciente 🍳',
      reward: '+30 pts no Score'
    },
    {
      id: 'ch_leak',
      title: 'Caçador de Ralos',
      desc: 'Cancele 1 assinatura esquecida',
      progressDays: 'Pronto para resgate',
      badge: 'Mente Focada 🎯',
      reward: '+20 pts no Score'
    }
  ],
  forecast: {
    daysRemaining: 9,
    projectedClosingBalance: 1245.50,
    safeDailySpend: 88.48,
    confidence: 92
  }
};

// =============================================================================
// 2. REACTIVE STATE STORE MANAGER
// =============================================================================
class AuraStore {
  constructor() {
    const saved = localStorage.getItem('aura_finance_state');
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch (e) {
        console.warn('Erro ao restaurar estado salvo. Usando dados padrão.');
        this.state = JSON.parse(JSON.stringify(DEFAULT_FINANCIAL_STATE));
      }
    } else {
      this.state = JSON.parse(JSON.stringify(DEFAULT_FINANCIAL_STATE));
      this.persist();
    }
  }

  persist() {
    localStorage.setItem('aura_finance_state', JSON.stringify(this.state));
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_FINANCIAL_STATE));
    this.persist();
  }

  addTransaction(tx) {
    this.state.transactions.unshift(tx);
    
    // Atualiza saldo da conta correspondente
    const acc = this.state.accounts.find(a => a.name === tx.account);
    if (acc) {
      acc.balance += tx.amount;
    }

    // Atualiza gasto na categoria correspondente
    const cat = this.state.categories.find(c => c.id === tx.category);
    if (cat && tx.direction === 'OUTFLOW') {
      cat.spent += Math.abs(tx.amount);
    }

    this.recalculateForecast();
    this.persist();
  }

  depositToGoal(goalId, amount) {
    const goal = this.state.goals.find(g => g.id === goalId);
    if (goal) {
      goal.currentAmount += amount;
      
      // Registra transação de aporte
      this.addTransaction({
        id: 'tx_' + Date.now(),
        description: `Aporte Meta: ${goal.title}`,
        cleanMerchant: goal.title,
        amount: -amount,
        direction: 'OUTFLOW',
        category: 'savings_reserve',
        categoryLabel: 'Aporte Meta',
        budgetRule: 'SAVINGS_20',
        account: 'Inter Invest',
        method: 'PIX',
        date: new Date().toISOString(),
        icon: '🎯'
      });
      
      this.persist();
    }
  }

  removeLeak(leakId) {
    const leak = this.state.leaks.find(l => l.id === leakId);
    if (leak) {
      this.state.leaks = this.state.leaks.filter(l => l.id !== leakId);
      this.recalculateForecast();
      this.persist();
    }
  }

  recalculateForecast() {
    const checkingAcc = this.state.accounts.find(a => a.type === 'CHECKING');
    const checkingBal = checkingAcc ? checkingAcc.balance : 2500;
    const days = this.state.forecast.daysRemaining;

    // Projeta despesas discricionárias
    const remainingSafeSpend = checkingBal - 1500; // Reserva mínima
    const safeDaily = remainingSafeSpend > 0 ? (remainingSafeSpend / days) : 10;
    
    this.state.forecast.safeDailySpend = Math.max(15, parseFloat(safeDaily.toFixed(2)));
    this.state.forecast.projectedClosingBalance = parseFloat((checkingBal - (safeDaily * days * 0.7)).toFixed(2));
  }
}

// =============================================================================
// 3. UI CONTROLLER & RENDERING ENGINE
// =============================================================================
class AuraApp {
  constructor() {
    this.store = new AuraStore();
    this.currentDepositGoalId = null;
    this.initElements();
    this.bindEvents();
    this.renderAll();
    this.startClock();
  }

  initElements() {
    // Navigation & View Mode
    this.btnViewMobile = document.getElementById('btnViewMobile');
    this.btnViewDesktop = document.getElementById('btnViewDesktop');
    this.viewportWrapper = document.getElementById('viewportWrapper');
    this.navButtons = document.querySelectorAll('.mobile-bottom-nav .nav-btn');
    this.tabPanels = document.querySelectorAll('.tab-panel');

    // Headers & KPIs
    this.totalLiquidBalance = document.getElementById('totalLiquidBalance');
    this.monthInflowTotal = document.getElementById('monthInflowTotal');
    this.monthOutflowTotal = document.getElementById('monthOutflowTotal');
    this.previewClosingBal = document.getElementById('previewClosingBal');
    this.previewSafeDaily = document.getElementById('previewSafeDaily');
    this.btnToggleHideValues = document.getElementById('btnToggleHideValues');
    this.eyeOpenIcon = document.getElementById('eyeOpenIcon');
    this.eyeClosedIcon = document.getElementById('eyeClosedIcon');
    this.topScoreVal = document.getElementById('topScoreVal');
    this.mainHealthScore = document.getElementById('mainHealthScore');
    this.scoreFillCircle = document.getElementById('scoreFillCircle');

    // 50/30/20 Monitor
    this.pctNeeds = document.getElementById('pctNeeds');
    this.pctWants = document.getElementById('pctWants');
    this.pctSavings = document.getElementById('pctSavings');
    this.barNeeds = document.getElementById('barNeeds');
    this.barWants = document.getElementById('barWants');
    this.barSavings = document.getElementById('barSavings');

    // Charts & Lists
    this.svgDonutChart = document.getElementById('svgDonutChart');
    this.donutTotalVal = document.getElementById('donutTotalVal');
    this.categoryLegendList = document.getElementById('categoryLegendList');
    this.transactionListContainer = document.getElementById('transactionListContainer');
    this.leakItemsList = document.getElementById('leakItemsList');
    this.totalLeaksAnnual = document.getElementById('totalLeaksAnnual');
    this.limitsListContainer = document.getElementById('limitsListContainer');
    this.goalsListContainer = document.getElementById('goalsListContainer');
    this.challengesGrid = document.getElementById('challengesGrid');

    // Futurômetro Tab
    this.futuroClosingAmount = document.getElementById('futuroClosingAmount');
    this.safeDailyValue = document.getElementById('safeDailyValue');
    this.simulatorSlider = document.getElementById('simulatorSlider');
    this.sliderValPreview = document.getElementById('sliderValPreview');
    this.sliderSimulationResult = document.getElementById('sliderSimulationResult');
    this.btnGoToFuturo = document.getElementById('btnGoToFuturo');

    // AI & Simulator
    this.btnCalculatePurchase = document.getElementById('btnCalculatePurchase');
    this.purchaseResultCard = document.getElementById('purchaseResultCard');
    this.verdictPill = document.getElementById('verdictPill');
    this.metricWorkHours = document.getElementById('metricWorkHours');
    this.metricBudgetShare = document.getElementById('metricBudgetShare');
    this.metricDailyImpact = document.getElementById('metricDailyImpact');
    this.rationaleText = document.getElementById('rationaleText');
    this.chatMessagesContainer = document.getElementById('chatMessagesContainer');
    this.chatInputText = document.getElementById('chatInputText');
    this.btnSendChat = document.getElementById('btnSendChat');

    // Modals
    this.modalTransaction = document.getElementById('modalTransaction');
    this.btnNewTransaction = document.getElementById('btnNewTransaction');
    this.btnCloseTxModal = document.getElementById('btnCloseTxModal');
    this.btnCancelTx = document.getElementById('btnCancelTx');
    this.btnSaveTx = document.getElementById('btnSaveTx');
    this.btnTypeExpense = document.getElementById('btnTypeExpense');
    this.btnTypeIncome = document.getElementById('btnTypeIncome');

    this.modalGoalDeposit = document.getElementById('modalGoalDeposit');
    this.btnCloseGoalModal = document.getElementById('btnCloseGoalModal');
    this.btnCancelGoalDeposit = document.getElementById('btnCancelGoalDeposit');
    this.btnConfirmGoalDeposit = document.getElementById('btnConfirmGoalDeposit');
    this.depositGoalTitle = document.getElementById('depositGoalTitle');
    this.depositGoalCurrent = document.getElementById('depositGoalCurrent');
    this.goalDepositAmount = document.getElementById('goalDepositAmount');

    this.btnConfigAI = document.getElementById('btnConfigAI');
    this.modalConfigAI = document.getElementById('modalConfigAI');
    this.btnCloseConfigModal = document.getElementById('btnCloseConfigModal');
    this.btnSaveApiKey = document.getElementById('btnSaveApiKey');
    this.btnClearApiKey = document.getElementById('btnClearApiKey');
    this.inputApiKey = document.getElementById('inputApiKey');

    this.btnOpenFinanceSync = document.getElementById('btnOpenFinanceSync');
    this.islandNotification = document.getElementById('islandNotification');
    this.phoneDynamicIsland = document.querySelector('.phone-dynamic-island');
    this.btnResetData = document.getElementById('btnResetData');
    this.toastContainer = document.getElementById('toastContainer');

    // Modal Edit Profile Elements
    this.modalEditProfile = document.getElementById('modalEditProfile');
    this.btnCloseEditProfileModal = document.getElementById('btnCloseEditProfileModal');
    this.btnCancelProfileEdit = document.getElementById('btnCancelProfileEdit');
    this.btnSaveProfileData = document.getElementById('btnSaveProfileData');
    this.btnOpenEditProfile = document.getElementById('btnOpenEditProfile');
    this.btnMenuEditProfile = document.getElementById('btnMenuEditProfile');
    this.editUserName = document.getElementById('editUserName');
    this.editNetIncome = document.getElementById('editNetIncome');
    this.editGrossIncome = document.getElementById('editGrossIncome');
    this.editWorkHours = document.getElementById('editWorkHours');
    this.calcHourlyPreview = document.getElementById('calcHourlyPreview');
    this.editCheckingBalance = document.getElementById('editCheckingBalance');
    this.editCardInvoice = document.getElementById('editCardInvoice');
    this.editInvestments = document.getElementById('editInvestments');
    this.checkClearDemoTransactions = document.getElementById('checkClearDemoTransactions');
    this.profileDisplayName = document.getElementById('profileDisplayName');
    this.profileAvatarText = document.getElementById('profileAvatarText');
    this.profileNetIncome = document.getElementById('profileNetIncome');
    this.profileHourlyWage = document.getElementById('profileHourlyWage');
    this.userHeaderGreetingName = document.querySelector('.user-name');
    this.userHeaderAvatarText = document.querySelector('.avatar-text');
  }

  bindEvents() {
    // Mode switcher (Mobile vs Desktop)
    this.btnViewMobile.addEventListener('click', () => this.switchViewMode('mobile'));
    this.btnViewDesktop.addEventListener('click', () => this.switchViewMode('desktop'));

    // Profile Edit Modal
    if (this.btnOpenEditProfile) {
      this.btnOpenEditProfile.addEventListener('click', () => this.openEditProfileModal());
    }
    if (this.btnMenuEditProfile) {
      this.btnMenuEditProfile.addEventListener('click', () => this.openEditProfileModal());
    }
    const avatarBadge = document.querySelector('.avatar-badge');
    if (avatarBadge) {
      avatarBadge.style.cursor = 'pointer';
      avatarBadge.title = 'Clique para editar seu perfil';
      avatarBadge.addEventListener('click', () => this.openEditProfileModal());
    }
    if (this.btnCloseEditProfileModal) {
      this.btnCloseEditProfileModal.addEventListener('click', () => this.closeEditProfileModal());
    }
    if (this.btnCancelProfileEdit) {
      this.btnCancelProfileEdit.addEventListener('click', () => this.closeEditProfileModal());
    }
    if (this.btnSaveProfileData) {
      this.btnSaveProfileData.addEventListener('click', () => this.handleSaveProfileData());
    }

    const updateHourlyLive = () => {
      const net = parseFloat(this.editNetIncome.value) || 0;
      const hours = parseFloat(this.editWorkHours.value) || 160;
      const wage = hours > 0 ? (net / hours).toFixed(2) : '0.00';
      this.calcHourlyPreview.value = `R$ ${this.formatCurrency(parseFloat(wage))} / h`;
    };
    if (this.editNetIncome) this.editNetIncome.addEventListener('input', updateHourlyLive);
    if (this.editWorkHours) this.editWorkHours.addEventListener('input', updateHourlyLive);

    // Tab Navigation
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab, btn);
      });
    });

    if (this.btnGoToFuturo) {
      this.btnGoToFuturo.addEventListener('click', () => {
        const targetBtn = document.querySelector('.nav-btn[data-tab="panel-futuro"]');
        this.switchTab('panel-futuro', targetBtn);
      });
    }

    // Hide/Show Values
    this.btnToggleHideValues.addEventListener('click', () => this.toggleHideValues());

    // Futurômetro Slider Simulation
    this.simulatorSlider.addEventListener('input', (e) => this.onSliderSimulate(e.target.value));

    // Posso Comprar? Simulation
    this.btnCalculatePurchase.addEventListener('click', () => this.handleCalculatePurchase());

    // Chat
    this.btnSendChat.addEventListener('click', () => this.handleSendChatMessage());

    // Modals: New Transaction
    this.btnNewTransaction.addEventListener('click', () => this.openTransactionModal());
    this.btnCloseTxModal.addEventListener('click', () => this.closeTransactionModal());
    this.btnCancelTx.addEventListener('click', () => this.closeTransactionModal());
    this.btnSaveTx.addEventListener('click', () => this.handleSaveTransaction());

    this.btnTypeExpense.addEventListener('click', () => {
      this.btnTypeExpense.className = 'btn-type-toggle active-expense';
      this.btnTypeIncome.className = 'btn-type-toggle';
    });

    this.btnTypeIncome.addEventListener('click', () => {
      this.btnTypeIncome.className = 'btn-type-toggle active-income';
      this.btnTypeExpense.className = 'btn-type-toggle';
    });

    // Modals: Goal Deposit
    this.btnCloseGoalModal.addEventListener('click', () => this.closeGoalModal());
    this.btnCancelGoalDeposit.addEventListener('click', () => this.closeGoalModal());
    this.btnConfirmGoalDeposit.addEventListener('click', () => this.handleConfirmGoalDeposit());

    // Modals: AI Config
    this.btnConfigAI.addEventListener('click', () => this.openConfigModal());
    this.btnCloseConfigModal.addEventListener('click', () => this.closeConfigModal());
    this.btnSaveApiKey.addEventListener('click', () => this.saveApiKey());
    this.btnClearApiKey.addEventListener('click', () => this.clearApiKey());

    // Open Finance Simulation
    this.btnOpenFinanceSync.addEventListener('click', () => this.triggerOpenFinanceSync());

    // Reset Data
    this.btnResetData.addEventListener('click', () => {
      if (confirm('Deseja resetar todos os dados para o estado de demonstração original?')) {
        this.store.reset();
        this.renderAll();
        this.showToast('Dados restaurados com sucesso!');
      }
    });

    // Debt Strategy Toggle
    const btnAv = document.getElementById('btnDebtAvalanche');
    const btnSnow = document.getElementById('btnDebtSnowball');
    if (btnAv && btnSnow) {
      btnAv.addEventListener('click', () => {
        btnAv.classList.add('active');
        btnSnow.classList.remove('active');
        this.renderDebtStrategy('avalanche');
      });
      btnSnow.addEventListener('click', () => {
        btnSnow.classList.add('active');
        btnAv.classList.remove('active');
        this.renderDebtStrategy('snowball');
      });
    }
  }

  // ===========================================================================
  // RENDER METHODS
  // ===========================================================================
  renderAll() {
    this.renderHeaderBalances();
    this.render503020();
    this.renderDonutChart();
    this.renderTransactions();
    this.renderFuturo();
    this.renderLeaks();
    this.renderLimits();
    this.renderGoals();
    this.renderChallenges();
    this.renderDebtStrategy('avalanche');
    this.renderHealthScore();
  }

  formatCurrency(val) {
    if (this.store.state.user.hideValues) return '••••••';
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  renderHeaderBalances() {
    // Total Patrimônio Líquido (soma de saldos das contas)
    const total = this.store.state.accounts.reduce((acc, curr) => acc + curr.balance, 0);
    this.totalLiquidBalance.textContent = this.formatCurrency(total);

    // Entradas e Saídas do Mês
    const inflows = this.store.state.transactions
      .filter(t => t.direction === 'INFLOW')
      .reduce((sum, t) => sum + t.amount, 0);

    const outflows = this.store.state.transactions
      .filter(t => t.direction === 'OUTFLOW')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    this.monthInflowTotal.textContent = `+ R$ ${this.formatCurrency(inflows)}`;
    this.monthOutflowTotal.textContent = `- R$ ${this.formatCurrency(outflows)}`;

    // Preview do Futurômetro
    this.previewClosingBal.textContent = this.formatCurrency(this.store.state.forecast.projectedClosingBalance);
    this.previewSafeDaily.textContent = `R$ ${this.formatCurrency(this.store.state.forecast.safeDailySpend)}/dia`;

    // Atualiza dados de identificação do usuário
    const user = this.store.state.user;
    if (this.userHeaderGreetingName) this.userHeaderGreetingName.textContent = user.name;
    if (this.userHeaderAvatarText) this.userHeaderAvatarText.textContent = user.avatar || 'US';
    if (this.profileDisplayName) this.profileDisplayName.textContent = user.name;
    if (this.profileAvatarText) this.profileAvatarText.textContent = user.avatar || 'US';
    if (this.profileNetIncome) this.profileNetIncome.textContent = `R$ ${this.formatCurrency(user.monthlyNetIncome)}`;
    if (this.profileHourlyWage) this.profileHourlyWage.textContent = `R$ ${this.formatCurrency(user.hourlyWage)} / h`;
  }

  render503020() {
    const net = this.store.state.user.monthlyNetIncome; // R$ 8.500
    const needsSpent = this.store.state.categories
      .filter(c => c.rule === 'NEEDS_50')
      .reduce((acc, c) => acc + c.spent, 0);

    const wantsSpent = this.store.state.categories
      .filter(c => c.rule === 'WANTS_30')
      .reduce((acc, c) => acc + c.spent, 0);

    const savingsSpent = this.store.state.categories
      .filter(c => c.rule === 'SAVINGS_20')
      .reduce((acc, c) => acc + c.spent, 0);

    const pctN = ((needsSpent / net) * 100).toFixed(1);
    const pctW = ((wantsSpent / net) * 100).toFixed(1);
    const pctS = ((savingsSpent / net) * 100).toFixed(1);

    this.pctNeeds.textContent = `${pctN}%`;
    this.pctWants.textContent = `${pctW}%`;
    this.pctSavings.textContent = `${pctS}%`;

    this.barNeeds.style.width = `${Math.min(pctN, 100)}%`;
    this.barWants.style.width = `${Math.min(pctW, 100)}%`;
    this.barSavings.style.width = `${Math.min(pctS, 100)}%`;

    const statusBadge = document.getElementById('status503020');
    if (pctN <= 52 && pctW <= 32) {
      statusBadge.textContent = 'Saudável';
      statusBadge.className = 'badge-status-ok';
    } else {
      statusBadge.textContent = 'Atenção';
      statusBadge.className = 'badge-danger';
    }
  }

  renderDonutChart() {
    const categories = this.store.state.categories;
    const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
    this.donutTotalVal.textContent = `R$ ${this.formatCurrency(totalSpent)}`;

    // Gera segmentos SVG Donut com stroke-dasharray
    const radius = 68;
    const circumference = 2 * Math.PI * radius; // ~427.25
    let offset = 0;
    let svgHtml = '';
    let legendHtml = '';

    categories.forEach((cat) => {
      const share = totalSpent > 0 ? (cat.spent / totalSpent) : 0;
      const strokeDash = share * circumference;
      const strokeGap = circumference - strokeDash;

      svgHtml += `
        <circle class="donut-segment" cx="100" cy="100" r="${radius}"
          stroke="${cat.color}"
          stroke-dasharray="${strokeDash} ${strokeGap}"
          stroke-dashoffset="${-offset}">
        </circle>
      `;

      offset += strokeDash;

      const pct = (share * 100).toFixed(1);
      legendHtml += `
        <div class="cat-item-row">
          <div class="cat-left">
            <div class="cat-icon-badge" style="background: ${cat.color}22; color: ${cat.color}">
              ${cat.icon}
            </div>
            <span class="cat-name">${cat.name}</span>
          </div>
          <div class="cat-right">
            <span class="cat-amount">R$ ${this.formatCurrency(cat.spent)}</span>
            <span class="cat-percent">${pct}%</span>
          </div>
        </div>
      `;
    });

    this.svgDonutChart.innerHTML = svgHtml;
    this.categoryLegendList.innerHTML = legendHtml;
  }

  renderTransactions() {
    const list = this.store.state.transactions;
    let html = '';

    list.slice(0, 6).forEach(tx => {
      const isOutflow = tx.direction === 'OUTFLOW';
      const sign = isOutflow ? '-' : '+';
      const amountClass = isOutflow ? 'outflow' : 'inflow';
      
      let tagRuleClass = 'tag-needs';
      if (tx.budgetRule === 'WANTS_30') tagRuleClass = 'tag-wants';
      if (tx.budgetRule === 'SAVINGS_20') tagRuleClass = 'tag-savings';

      const dateStr = new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

      html += `
        <div class="tx-item">
          <div class="tx-left">
            <div class="tx-avatar">${tx.icon || '💳'}</div>
            <div>
              <div class="tx-title">${tx.cleanMerchant || tx.description}</div>
              <div class="tx-meta">
                <span>${dateStr}</span> • <span>${tx.account}</span>
                <span class="tx-tag-rule ${tagRuleClass}">${tx.categoryLabel || 'Geral'}</span>
              </div>
            </div>
          </div>
          <div class="tx-amount ${amountClass}">
            ${sign} R$ ${this.formatCurrency(Math.abs(tx.amount))}
          </div>
        </div>
      `;
    });

    this.transactionListContainer.innerHTML = html;
  }

  renderFuturo() {
    this.futuroClosingAmount.textContent = this.formatCurrency(this.store.state.forecast.projectedClosingBalance);
    this.safeDailyValue.textContent = `R$ ${this.formatCurrency(this.store.state.forecast.safeDailySpend)} / dia`;
    this.sliderValPreview.textContent = `R$ ${this.formatCurrency(this.store.state.forecast.safeDailySpend)}`;
    this.simulatorSlider.value = Math.round(this.store.state.forecast.safeDailySpend);
  }

  onSliderSimulate(val) {
    const daily = parseFloat(val);
    this.sliderValPreview.textContent = `R$ ${daily.toFixed(2)}`;
    const days = this.store.state.forecast.daysRemaining;
    const baseDaily = this.store.state.forecast.safeDailySpend;
    const diff = (daily - baseDaily) * days;
    const newClosing = this.store.state.forecast.projectedClosingBalance - diff;

    if (diff > 0) {
      this.sliderSimulationResult.innerHTML = `Gastando R$ ${daily.toFixed(2)}/dia, seu saldo final cairá para <strong style="color: var(--accent-coral)">R$ ${this.formatCurrency(newClosing)}</strong> (-R$ ${this.formatCurrency(diff)}).`;
    } else if (diff < 0) {
      this.sliderSimulationResult.innerHTML = `Economizando e gastando R$ ${daily.toFixed(2)}/dia, você fechará com <strong style="color: var(--accent-emerald)">R$ ${this.formatCurrency(newClosing)}</strong> de sobra (+R$ ${this.formatCurrency(Math.abs(diff))})! 🚀`;
    } else {
      this.sliderSimulationResult.innerHTML = 'Impacto no saldo final: <strong>Sem alterações</strong>.';
    }
  }

  renderLeaks() {
    const leaks = this.store.state.leaks;
    const annualTotal = leaks.reduce((acc, l) => acc + l.costAnnual, 0);
    this.totalLeaksAnnual.textContent = `R$ ${this.formatCurrency(annualTotal)} / ano`;

    let html = '';
    leaks.forEach(l => {
      html += `
        <div class="leak-card">
          <div class="leak-info">
            <div class="leak-title">${l.title}</div>
            <div class="leak-calc">Custa R$ ${this.formatCurrency(l.costMonthly)}/mês (${l.note})</div>
          </div>
          <div class="leak-right">
            <div class="leak-cost-annual">- R$ ${this.formatCurrency(l.costAnnual)}/ano</div>
            <button class="btn-plug-leak" onclick="app.plugLeak('${l.id}')">Plugue o Ralo! 🛑</button>
          </div>
        </div>
      `;
    });

    if (leaks.length === 0) {
      html = '<div style="text-align: center; color: var(--accent-emerald); padding: 12px; font-weight: 600;">Parabéns! Nenhum ralo financeiro ativo no momento. 🛡️</div>';
    }

    this.leakItemsList.innerHTML = html;
  }

  plugLeak(leakId) {
    this.store.removeLeak(leakId);
    this.renderLeaks();
    this.renderFuturo();
    this.showToast('Ralo plugado! O valor anualizado foi liberado para sua Reserva de Emergência.');
  }

  renderLimits() {
    let html = '';
    this.store.state.categories.forEach(cat => {
      const pct = Math.min(((cat.spent / cat.limit) * 100), 100).toFixed(0);
      let barColor = 'var(--accent-emerald)';
      if (pct >= 90) barColor = 'var(--accent-coral)';
      else if (pct >= 75) barColor = 'var(--accent-amber)';

      html += `
        <div class="limit-item">
          <div class="limit-header">
            <span class="limit-category">${cat.icon} ${cat.name}</span>
            <span class="limit-amounts">R$ ${this.formatCurrency(cat.spent)} / R$ ${this.formatCurrency(cat.limit)} (${pct}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" style="width: ${pct}%; background: ${barColor}"></div>
          </div>
        </div>
      `;
    });

    this.limitsListContainer.innerHTML = html;
  }

  renderGoals() {
    let html = '';
    this.store.state.goals.forEach(goal => {
      const pct = Math.min(((goal.currentAmount / goal.targetAmount) * 100), 100).toFixed(0);
      html += `
        <div class="goal-card">
          <div class="goal-top-row">
            <div>
              <span class="goal-name">${goal.icon} ${goal.title}</span>
              <div class="goal-deadline">Meta para ${goal.deadline}</div>
            </div>
            <span class="badge-tag">${pct}% concluído</span>
          </div>
          <div class="goal-progress-wrap">
            <div class="goal-amounts-row">
              <span class="goal-current">R$ ${this.formatCurrency(goal.currentAmount)}</span>
              <span class="goal-target">Alvo: R$ ${this.formatCurrency(goal.targetAmount)}</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar" style="width: ${pct}%; background: ${goal.color}"></div>
            </div>
          </div>
          <button class="btn-deposit-goal" onclick="app.openGoalDepositModal('${goal.id}')">+ Guardar Dinheiro nesta Caixinha</button>
        </div>
      `;
    });

    this.goalsListContainer.innerHTML = html;
  }

  renderChallenges() {
    let html = '';
    this.store.state.challenges.forEach(ch => {
      html += `
        <div class="challenge-card">
          <div class="ch-info">
            <div class="ch-title">${ch.title}</div>
            <div class="ch-sub">${ch.desc} • <strong>${ch.progressDays}</strong></div>
          </div>
          <button class="btn-claim-badge" onclick="app.claimBadge('${ch.id}')">Resgatar</button>
        </div>
      `;
    });

    this.challengesGrid.innerHTML = html;
  }

  claimBadge(chId) {
    this.showToast('🎉 Conquista desbloqueada! +25 pontos adicionados ao seu Score de Saúde!');
  }

  renderDebtStrategy(type) {
    const resultBox = document.getElementById('debtResultBox');
    if (!resultBox) return;

    if (type === 'avalanche') {
      resultBox.innerHTML = `
        <div style="font-size: 13px; color: var(--text-white); margin-bottom: 6px;">
          <strong>Estratégia: Juros Decrescentes (Avalanche)</strong>
        </div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 8px;">
          Foco na fatura do Cartão (14% a.m.) antes do Empréstimo (4% a.m.).
        </p>
        <div style="display: flex; justify-content: space-between; font-size: 12px; background: rgba(0, 210, 255, 0.08); padding: 8px; border-radius: 6px;">
          <span>Economia estimada em juros:</span>
          <strong style="color: var(--accent-emerald)">R$ 3.840,00</strong>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
          Prazo total de quitação: <strong>11 meses (4 meses mais rápido)</strong>.
        </div>
      `;
    } else {
      resultBox.innerHTML = `
        <div style="font-size: 13px; color: var(--text-white); margin-bottom: 6px;">
          <strong>Estratégia: Menores Saldos Primeiro (Bola de Neve)</strong>
        </div>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 8px;">
          Quitação da dívida de menor valor primeiro para vitórias psicológicas rápidas.
        </p>
        <div style="display: flex; justify-content: space-between; font-size: 12px; background: rgba(157, 78, 221, 0.08); padding: 8px; border-radius: 6px;">
          <span>Economia estimada em juros:</span>
          <strong style="color: var(--accent-cyan)">R$ 2.450,00</strong>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
          Prazo total de quitação: <strong>14 meses</strong>.
        </div>
      `;
    }
  }

  renderHealthScore() {
    const score = 84;
    this.topScoreVal.textContent = score;
    this.mainHealthScore.textContent = score;
    
    // Animação de preenchimento do círculo SVG
    // Circunferência de raio 42 = 2 * PI * 42 ≈ 263.89
    const circumference = 2 * Math.PI * 42;
    const offset = circumference - (circumference * score / 100);
    this.scoreFillCircle.style.strokeDashoffset = offset;
  }

  // ===========================================================================
  // SIMULADOR "POSSO COMPRAR?" & GEMINI IA
  // ===========================================================================
  handleCalculatePurchase() {
    const itemName = document.getElementById('inputItemName').value.trim();
    const itemAmount = parseFloat(document.getElementById('inputItemAmount').value);
    const category = document.getElementById('selectItemCategory').value;
    const paymentMethod = document.getElementById('selectPaymentMethod').value;

    if (!itemName || isNaN(itemAmount) || itemAmount <= 0) {
      alert('Por favor, informe o nome do item e um valor válido.');
      return;
    }

    const hourlyWage = this.store.state.user.hourlyWage; // R$ 53,12/h
    const workHours = itemAmount / hourlyWage;
    const hoursPart = Math.floor(workHours);
    const minutesPart = Math.round((workHours - hoursPart) * 60);

    const safeDaily = this.store.state.forecast.safeDailySpend;
    const days = this.store.state.forecast.daysRemaining;
    const totalRemainingSafe = safeDaily * days;

    const shareOfBudget = Math.min(((itemAmount / totalRemainingSafe) * 100), 100).toFixed(1);
    const impactOnDaily = (itemAmount / days).toFixed(2);
    const newDaily = Math.max(0, (safeDaily - (itemAmount / days))).toFixed(2);

    this.metricWorkHours.textContent = `${hoursPart}h ${minutesPart}min`;
    this.metricBudgetShare.textContent = `${shareOfBudget}%`;
    this.metricDailyImpact.textContent = `- R$ ${this.formatCurrency(parseFloat(impactOnDaily))}`;

    this.purchaseResultCard.classList.remove('hidden', 'verdict-green', 'verdict-yellow', 'verdict-red');

    let verdict = 'green';
    let verdictLabel = '🟢 Aprovado com Folga';
    let rationale = '';

    if (shareOfBudget > 70 || itemAmount > totalRemainingSafe) {
      verdict = 'red';
      verdictLabel = '🔴 Risco Financeiro';
      this.purchaseResultCard.classList.add('verdict-red');
      rationale = `Comprar "${itemName}" por R$ ${this.formatCurrency(itemAmount)} custará **${hoursPart}h e ${minutesPart}min de trabalho líquido** e consumirá mais de 70% da sua folga de caixa restante. Seu gasto diário seguro despencará para R$ ${this.formatCurrency(parseFloat(newDaily))}/dia, aumentando o risco de entrar no rotativo do cartão ou atrasar sua meta de Reserva de Emergência. Recomendo adiar para o próximo mês ou aplicar a Regra dos 3 Dias.`;
    } else if (shareOfBudget >= 30) {
      verdict = 'yellow';
      verdictLabel = '🟡 Requer Cautela';
      this.purchaseResultCard.classList.add('verdict-yellow');
      rationale = `"${itemName}" custa **${hoursPart}h e ${minutesPart}min de trabalho**. O valor consome ${shareOfBudget}% da sua folga no mês. Em pagamento parcelado ou esperando o fechamento da próxima fatura em 8 dias, o impacto no seu dia a dia fica suave (reduzindo de R$ ${this.formatCurrency(safeDaily)} para R$ ${this.formatCurrency(parseFloat(newDaily))}/dia). Se não for indispensável hoje, planeje a compra para a virada do ciclo.`;
    } else {
      verdict = 'green';
      verdictLabel = '🟢 Compra Tranquila';
      this.purchaseResultCard.classList.add('verdict-green');
      rationale = `Excelente! Esse gasto de R$ ${this.formatCurrency(itemAmount)} consome apenas ${shareOfBudget}% da sua margem livre e representa ${hoursPart}h de trabalho. Ele não compromete nenhuma de suas caixinhas nem seus limites da regra 50/30/20. Pode comprar com tranquilidade!`;
    }

    this.verdictPill.textContent = verdictLabel;
    this.rationaleText.innerHTML = rationale;
  }

  // ===========================================================================
  // CHAT ASSISTANT
  // ===========================================================================
  sendQuickPrompt(promptText) {
    this.chatInputText.value = promptText;
    this.handleSendChatMessage();
  }

  handleSendChatMessage() {
    const text = this.chatInputText.value.trim();
    if (!text) return;

    this.addChatMessage('user', text);
    this.chatInputText.value = '';

    // Efeito de "digitando..."
    setTimeout(() => {
      this.generateAIResponse(text);
    }, 600);
  }

  addChatMessage(sender, message) {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const isUser = sender === 'user';
    const bubbleClass = isUser ? 'user-bubble' : 'ai-bubble';
    const senderName = isUser ? 'Você' : 'FinAI';

    const div = document.createElement('div');
    div.className = `chat-bubble ${bubbleClass}`;
    div.innerHTML = `
      <div class="bubble-sender">${senderName}</div>
      <div class="bubble-content">${message}</div>
      <div class="bubble-time">${time}</div>
    `;

    this.chatMessagesContainer.appendChild(div);
    this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
  }

  async generateAIResponse(userQuery) {
    const apiKey = this.store.state.user.geminiApiKey;
    
    // Se houver chave Gemini API configurada, tenta chamada direta
    if (apiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Você é o FinAI, assistente financeiro do app Aura Finance. Contexto da usuária: Mariana, Renda líquida R$ 8.500,00, Saldo em conta R$ 3.420,00, Saldo previsto de fechamento do mês R$ 1.245,50, Gasto diário seguro R$ 88,48/dia. Responda de forma curta, prática e empática em português à pergunta: "${userQuery}".`
              }]
            }]
          })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          this.addChatMessage('ai', data.candidates[0].content.parts[0].text);
          return;
        }
      } catch (err) {
        console.warn('Falha na API Gemini, usando motor comportamental local:', err);
      }
    }

    // Motor Cognitivo Local Especializado em Finanças
    const queryLower = userQuery.toLowerCase();
    let reply = '';

    if (queryLower.includes('jantar') || queryLower.includes('120') || queryLower.includes('restaurante')) {
      reply = `Analisando seu Futurômetro: seu gasto diário seguro é de **R$ 88,48/dia**. Um jantar de R$ 120,00 ultrapassa a cota de hoje em R$ 31,52, mas você tem R$ 1.245,50 de superávit projetado no fim do mês! Se compensar economizando R$ 15 amanhã e depois, sua meta continuará 100% no verde. Bom apetite! 🍽️`;
    } else if (queryLower.includes('reserva') || queryLower.includes('emergência') || queryLower.includes('acelerar')) {
      reply = `Você já atingiu **R$ 18.500 de R$ 30.000 (62%)** da sua Reserva! Detectamos R$ 4.280/ano em ralos financeiros (como a academia ociosa e assinaturas esquecidas). Se você cancelar a academia e realocar esses R$ 149,90/mês para a caixinha, você alcançará os R$ 30.000 em **novembro de 2026** (2 meses antes do prazo planejado)! 🚀`;
    } else if (queryLower.includes('assinatura') || queryLower.includes('cancelar') || queryLower.includes('ralo')) {
      reply = `Identifiquei 3 assinaturas que você pode revisar agora: 1) **Smart Fit** (R$ 149,90/mês sem check-in há 42 dias); 2) **Streaming de Vídeo Secundário** (R$ 55,90/mês com 1h de uso). Juntas, elas liberam **R$ 205,80 todo mês** na sua conta! Deseja que eu marque para cancelamento?`;
    } else {
      reply = `Com base nas suas 3 contas conectadas via Open Finance, você está com **84/100 no Score de Saúde Financeira**. Seus gastos essenciais (50%) estão em 48,2% e você tem R$ 88,48 de gasto livre por dia até o dia 31. Como mais posso te orientar hoje?`;
    }

    this.addChatMessage('ai', reply);
  }

  // ===========================================================================
  // OPEN FINANCE SIMULATION
  // ===========================================================================
  triggerOpenFinanceSync() {
    this.btnOpenFinanceSync.classList.add('syncing');
    this.phoneDynamicIsland.classList.add('expanded');
    this.islandNotification.style.display = 'flex';
    document.getElementById('islandText').textContent = 'Open Finance: Conciliando...';

    setTimeout(() => {
      // Simula uma nova transação importada automaticamente do cartão
      const newTx = {
        id: 'tx_auto_' + Date.now(),
        description: 'Padaria Bella Paulista',
        cleanMerchant: 'Bella Paulista',
        amount: -28.50,
        direction: 'OUTFLOW',
        category: 'needs_supermarket',
        categoryLabel: 'Alimentação',
        budgetRule: 'NEEDS_50',
        account: 'Nubank',
        method: 'DEBIT_CARD',
        date: new Date().toISOString(),
        icon: '🥐'
      };

      this.store.addTransaction(newTx);
      this.renderAll();

      this.btnOpenFinanceSync.classList.remove('syncing');
      document.getElementById('islandText').textContent = 'Conciliado: 1 nova transação';
      this.showToast('Open Finance sincronizado com sucesso! (Nubank, Itaú e Inter atualizados)');

      setTimeout(() => {
        this.phoneDynamicIsland.classList.remove('expanded');
        this.islandNotification.style.display = 'none';
      }, 3500);
    }, 1800);
  }

  // ===========================================================================
  // MODAL ACTIONS
  // ===========================================================================
  openTransactionModal() {
    this.modalTransaction.classList.remove('hidden');
    document.getElementById('txDescription').focus();
  }

  closeTransactionModal() {
    this.modalTransaction.classList.add('hidden');
    document.getElementById('formTransaction').reset();
  }

  handleSaveTransaction() {
    const desc = document.getElementById('txDescription').value.trim();
    const amountVal = parseFloat(document.getElementById('txAmount').value);
    const category = document.getElementById('txCategory').value;
    const account = document.getElementById('txAccount').value;
    const method = document.getElementById('txPaymentMethod').value;
    const isIncome = this.btnTypeIncome.classList.contains('active-income');

    if (!desc || isNaN(amountVal) || amountVal <= 0) {
      alert('Preencha a descrição e um valor positivo.');
      return;
    }

    const direction = isIncome ? 'INFLOW' : 'OUTFLOW';
    const amount = isIncome ? amountVal : -amountVal;

    let budgetRule = 'NEEDS_50';
    let icon = '🏷️';
    if (category.startsWith('wants_')) { budgetRule = 'WANTS_30'; icon = '🛍️'; }
    if (category.startsWith('savings_')) { budgetRule = 'SAVINGS_20'; icon = '📈'; }
    if (isIncome) { budgetRule = 'INFLOW'; icon = '💵'; }

    const newTx = {
      id: 'tx_user_' + Date.now(),
      description: desc,
      cleanMerchant: desc,
      amount: amount,
      direction: direction,
      category: category,
      categoryLabel: isIncome ? 'Receita' : 'Despesa',
      budgetRule: budgetRule,
      account: account,
      method: method,
      date: new Date().toISOString(),
      icon: icon
    };

    this.store.addTransaction(newTx);
    this.closeTransactionModal();
    this.renderAll();
    this.showToast('Transação salva com sucesso!');
  }

  openGoalDepositModal(goalId) {
    this.currentDepositGoalId = goalId;
    const goal = this.store.state.goals.find(g => g.id === goalId);
    if (goal) {
      this.depositGoalTitle.textContent = `${goal.icon} ${goal.title}`;
      this.depositGoalCurrent.textContent = `Atual: R$ ${this.formatCurrency(goal.currentAmount)} de R$ ${this.formatCurrency(goal.targetAmount)}`;
      this.goalDepositAmount.value = '';
      this.modalGoalDeposit.classList.remove('hidden');
      this.goalDepositAmount.focus();
    }
  }

  closeGoalModal() {
    this.modalGoalDeposit.classList.add('hidden');
    this.currentDepositGoalId = null;
  }

  handleConfirmGoalDeposit() {
    const val = parseFloat(this.goalDepositAmount.value);
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor de aporte válido.');
      return;
    }

    this.store.depositToGoal(this.currentDepositGoalId, val);
    this.closeGoalModal();
    this.renderAll();
    this.showToast(`Aporte de R$ ${this.formatCurrency(val)} guardado com sucesso na Caixinha! 🚀`);
  }

  openConfigModal() {
    this.inputApiKey.value = this.store.state.user.geminiApiKey || '';
    this.modalConfigAI.classList.remove('hidden');
  }

  closeConfigModal() {
    this.modalConfigAI.classList.add('hidden');
  }

  saveApiKey() {
    const key = this.inputApiKey.value.trim();
    this.store.state.user.geminiApiKey = key;
    this.store.persist();
    this.closeConfigModal();
    this.showToast(key ? 'Chave Gemini API salva com sucesso!' : 'Modo local ativado.');
  }

  clearApiKey() {
    this.store.state.user.geminiApiKey = '';
    this.inputApiKey.value = '';
    this.store.persist();
    this.closeConfigModal();
    this.showToast('Chave removida. Usando motor comportamental local.');
  }

  // ===========================================================================
  // PROFILE & FINANCIAL DATA EDIT MODAL
  // ===========================================================================
  openEditProfileModal() {
    if (!this.modalEditProfile) return;
    const user = this.store.state.user;
    this.editUserName.value = user.name || '';
    this.editNetIncome.value = user.monthlyNetIncome || 8500;
    this.editGrossIncome.value = user.monthlyGrossIncome || 11200;
    this.editWorkHours.value = user.workHoursPerMonth || 160;

    const wage = user.workHoursPerMonth > 0 ? (user.monthlyNetIncome / user.workHoursPerMonth) : 53.12;
    this.calcHourlyPreview.value = `R$ ${this.formatCurrency(parseFloat(wage.toFixed(2)))} / h`;

    const checkingAcc = this.store.state.accounts.find(a => a.type === 'CHECKING');
    const cardAcc = this.store.state.accounts.find(a => a.type === 'CREDIT_CARD');
    const investAcc = this.store.state.accounts.find(a => a.type === 'INVESTMENT');

    this.editCheckingBalance.value = checkingAcc ? checkingAcc.balance : 0;
    this.editCardInvoice.value = cardAcc ? Math.abs(cardAcc.balance) : 0;
    this.editInvestments.value = investAcc ? investAcc.balance : 0;
    this.checkClearDemoTransactions.checked = false;

    this.modalEditProfile.classList.remove('hidden');
    this.editUserName.focus();
  }

  closeEditProfileModal() {
    if (this.modalEditProfile) {
      this.modalEditProfile.classList.add('hidden');
    }
  }

  handleSaveProfileData() {
    const name = this.editUserName.value.trim() || 'Usuário';
    const net = parseFloat(this.editNetIncome.value) || 0;
    const gross = parseFloat(this.editGrossIncome.value) || net;
    const hours = parseFloat(this.editWorkHours.value) || 160;
    const checkingBal = parseFloat(this.editCheckingBalance.value) || 0;
    const cardInv = parseFloat(this.editCardInvoice.value) || 0;
    const investBal = parseFloat(this.editInvestments.value) || 0;

    if (net <= 0) {
      alert('Por favor, informe uma renda líquida válida.');
      return;
    }

    const wage = parseFloat((net / hours).toFixed(2));

    // Gera iniciais para o avatar
    const parts = name.split(' ').filter(p => p.length > 0);
    const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();

    // Atualiza dados no estado
    this.store.state.user.name = name;
    this.store.state.user.avatar = initials;
    this.store.state.user.monthlyNetIncome = net;
    this.store.state.user.monthlyGrossIncome = gross;
    this.store.state.user.workHoursPerMonth = hours;
    this.store.state.user.hourlyWage = wage;

    // Atualiza saldos das contas
    const checkingAcc = this.store.state.accounts.find(a => a.type === 'CHECKING');
    if (checkingAcc) checkingAcc.balance = checkingBal;

    const cardAcc = this.store.state.accounts.find(a => a.type === 'CREDIT_CARD');
    if (cardAcc) cardAcc.balance = -Math.abs(cardInv);

    const investAcc = this.store.state.accounts.find(a => a.type === 'INVESTMENT');
    if (investAcc) investAcc.balance = investBal;

    // Se o usuário solicitou zerar as transações demo
    if (this.checkClearDemoTransactions && this.checkClearDemoTransactions.checked) {
      this.store.state.transactions = [];
      this.store.state.categories.forEach(c => { c.spent = 0; });
    }

    this.store.recalculateForecast();
    this.store.persist();
    this.closeEditProfileModal();
    this.renderAll();
    this.showToast(`Dados atualizados com sucesso, ${name.split(' ')[0]}! 🚀`);
  }

  // ===========================================================================
  // UTILITIES & VIEW SWITCHERS
  // ===========================================================================
  switchViewMode(mode) {
    if (mode === 'desktop') {
      this.viewportWrapper.className = 'app-viewport-wrapper mode-desktop';
      this.btnViewDesktop.classList.add('active');
      this.btnViewMobile.classList.remove('active');
    } else {
      this.viewportWrapper.className = 'app-viewport-wrapper mode-mobile';
      this.btnViewMobile.classList.add('active');
      this.btnViewDesktop.classList.remove('active');
    }
  }

  switchTab(targetPanelId, activeBtn) {
    this.tabPanels.forEach(panel => {
      panel.classList.remove('active');
    });

    const target = document.getElementById(targetPanelId);
    if (target) {
      target.classList.add('active');
      document.getElementById('tabContentScroll').scrollTop = 0;
    }

    this.navButtons.forEach(btn => btn.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
  }

  toggleHideValues() {
    this.store.state.user.hideValues = !this.store.state.user.hideValues;
    this.store.persist();

    if (this.store.state.user.hideValues) {
      this.eyeOpenIcon.classList.add('hidden');
      this.eyeClosedIcon.classList.remove('hidden');
    } else {
      this.eyeOpenIcon.classList.remove('hidden');
      this.eyeClosedIcon.classList.add('hidden');
    }

    this.renderAll();
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  startClock() {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const clockEl = document.getElementById('statusClock');
      if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
    };
    updateTime();
    setInterval(updateTime, 30000);
  }
}

// Global initialization
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new AuraApp();
});
