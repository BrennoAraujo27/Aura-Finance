/**
 * AURA WEALTH - CORE APPLICATION LOGIC (ES6)
 * Sistema de Controle Financeiro & Cartões de Crédito Inteligente
 * 100% Integrado ao Supabase (PostgreSQL + RLS + Auth)
 * Com lançamentos manuais, controle de faturas/limites e FinAI Parcelamento
 */

// =============================================================================
// 1. SUPABASE CLIENT & SEGURANÇA
// =============================================================================
const SUPABASE_URL = 'https://ryavbupwrpvdovctteef.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ZlAA4-NQ2mJrL8YNh88cYA_Rp2u6pKQ';

const supabaseClient = (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getDaysRemainingInMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const currentDay = now.getDate();
  return Math.max(1, lastDay - currentDay + 1);
}

// =============================================================================
// 2. ESTADO INICIAL REAL (MULTI-CARTÕES & DATAS IMPORTANTES)
// =============================================================================
const DEFAULT_FINANCIAL_STATE = {
  user: {
    id: null,
    email: '',
    name: 'Meu Perfil',
    role: 'MEMBRO AURA',
    avatar: 'MP',
    monthlyGrossIncome: 0.00,
    monthlyNetIncome: 0.00,
    salaryDay: 5,
    fixedExpensesDay: 10,
    workHoursPerMonth: 160,
    hourlyWage: 0.00,
    geminiApiKey: ''
  },
  accounts: [
    { id: 'acc_checking', name: 'Conta Corrente', type: 'CHECKING', balance: 0.00, dotClass: 'nu' },
    { id: 'acc_invest', name: 'Investimentos & Poupança', type: 'INVESTMENT', balance: 0.00, dotClass: 'inter' }
  ],
  cards: [
    { id: 'card_1', name: 'Cartão Principal', creditLimit: 5000.00, balance: 0.00, closingDay: 8, dueDay: 15 }
  ],
  transactions: [],
  leaks: [],
  forecast: {
    daysRemaining: getDaysRemainingInMonth(),
    projectedClosingBalance: 0.00,
    safeDailySpend: 0.00,
    inflowTotal: 0.00,
    outflowTotal: 0.00
  }
};

// =============================================================================
// 3. REACTIVE STORE MANAGER
// =============================================================================
class AuraStore {
  constructor() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_FINANCIAL_STATE));
    const saved = localStorage.getItem('aura_wealth_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.user) {
          this.state = parsed;
          if (!this.state.cards) this.state.cards = [];
        }
      } catch (e) {
        console.warn('Fallback para estado padrão');
      }
    }
    this.recalculateForecast();
  }

  persist() {
    try {
      localStorage.setItem('aura_wealth_state', JSON.stringify(this.state));
    } catch (e) {}
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_FINANCIAL_STATE));
    this.persist();
  }

  addTransaction(tx) {
    this.state.transactions.unshift(tx);
    
    // Se for compra no cartão de crédito: aumenta a fatura atual do cartão
    if (tx.accountType === 'CREDIT_CARD' || tx.cardId) {
      const card = this.state.cards.find(c => c.name === tx.account || c.id === tx.cardId);
      if (card) {
        card.balance = (parseFloat(card.balance) || 0) + Math.abs(tx.amount);
      }
    } else {
      // Se for conta corrente ou investimentos
      const acc = this.state.accounts.find(a => a.name === tx.account);
      if (acc) {
        acc.balance += tx.amount;
      }
    }

    this.recalculateForecast();
    this.persist();
  }

  recalculateForecast() {
    const checkingBalance = this.state.accounts
      .filter(a => a.type === 'CHECKING' || a.type === 'INVESTMENT')
      .reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

    const totalInvoices = this.state.cards.reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);

    // Patrimônio líquido disponível = saldo líquido em conta - faturas acumuladas de cartão
    const totalLiquid = checkingBalance - totalInvoices;
    const days = getDaysRemainingInMonth();
    this.state.forecast.daysRemaining = days;

    // Entradas e saídas reais
    let inflow = 0;
    let outflow = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    this.state.transactions.forEach(t => {
      const amt = Math.abs(parseFloat(t.amount) || 0);
      const txDate = t.date ? new Date(t.date) : new Date();
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        if (t.direction === 'INFLOW' || parseFloat(t.amount) > 0) {
          inflow += amt;
        } else {
          outflow += amt;
        }
      }
    });

    this.state.forecast.inflowTotal = inflow;
    this.state.forecast.outflowTotal = outflow;

    const monthlyNet = parseFloat(this.state.user.monthlyNetIncome) || 0;
    let remainingBudget = 0;
    if (monthlyNet > 0) {
      remainingBudget = Math.max(0, monthlyNet - outflow);
    } else {
      remainingBudget = Math.max(0, totalLiquid);
    }

    const safeDaily = remainingBudget > 0 ? (remainingBudget / days) : 0;
    this.state.forecast.safeDailySpend = parseFloat(safeDaily.toFixed(2));

    const pendingIncome = Math.max(0, monthlyNet - inflow);
    const projectedClosing = totalLiquid + pendingIncome - (safeDaily * days);
    this.state.forecast.projectedClosingBalance = parseFloat(projectedClosing.toFixed(2));
  }
}

// =============================================================================
// 4. UI CONTROLLER & APP ENGINE
// =============================================================================
class AuraApp {
  constructor() {
    this.supabase = supabaseClient;
    this.store = new AuraStore();
    this.authMode = 'login';
    this.currentUser = null;
    this.currentOnboardingStep = 1;

    this.initElements();
    this.bindEvents();
    this.bindAuthEvents();
    this.startClock();

    this.initSession();
  }

  initElements() {
    // Auth Elements
    this.authScreen = document.getElementById('authScreen');
    this.appMainView = document.getElementById('appMainView');
    this.btnAuthTabLogin = document.getElementById('btnAuthTabLogin');
    this.btnAuthTabSignup = document.getElementById('btnAuthTabSignup');
    this.groupSignupName = document.getElementById('groupSignupName');
    this.formAuth = document.getElementById('formAuth');
    this.authName = document.getElementById('authName');
    this.authEmail = document.getElementById('authEmail');
    this.authPassword = document.getElementById('authPassword');
    this.authErrorMessage = document.getElementById('authErrorMessage');
    this.btnSubmitAuth = document.getElementById('btnSubmitAuth');
    this.btnSubmitAuthText = document.getElementById('btnSubmitAuthText');
    this.btnLogoutUser = document.getElementById('btnLogoutUser');
    this.profileEmailSubtitle = document.getElementById('profileEmailSubtitle');

    // Navigation & View Mode
    this.btnViewMobile = document.getElementById('btnViewMobile');
    this.btnViewDesktop = document.getElementById('btnViewDesktop');
    this.viewportWrapper = document.getElementById('viewportWrapper');
    this.navButtons = document.querySelectorAll('.mobile-bottom-nav .nav-btn');
    this.tabPanels = document.querySelectorAll('.tab-panel');

    // Header & Actions
    this.btnHeaderAdd = document.getElementById('btnHeaderAdd');
    this.btnHeaderOnboarding = document.getElementById('btnHeaderOnboarding');
    this.btnNewTransaction = document.getElementById('btnNewTransaction');
    this.btnOpenOnboarding = document.getElementById('btnOpenOnboarding');
    this.btnConfigAI = document.getElementById('btnConfigAI');
    this.btnQuickAddPurchase = document.getElementById('btnQuickAddPurchase');
    this.btnQuickAdjustReal = document.getElementById('btnQuickAdjustReal');

    // Dashboard Cards & Limits Elements
    this.totalLiquidBalance = document.getElementById('totalLiquidBalance');
    this.monthInflowTotal = document.getElementById('monthInflowTotal');
    this.monthOutflowTotal = document.getElementById('monthOutflowTotal');
    this.totalCreditLimit = document.getElementById('totalCreditLimit');
    this.totalCurrentInvoice = document.getElementById('totalCurrentInvoice');
    this.totalAvailableLimit = document.getElementById('totalAvailableLimit');
    this.cardsMiniList = document.getElementById('cardsMiniList');
    this.btnManageCards = document.getElementById('btnManageCards');

    // Transactions List
    this.transactionListContainer = document.getElementById('transactionListContainer');

    // Futurômetro Tab
    this.futuroClosingAmount = document.getElementById('futuroClosingAmount');
    this.safeDailyValue = document.getElementById('safeDailyValue');
    this.simulatorSlider = document.getElementById('simulatorSlider');

    // FinAI Tab & Simulator
    this.inputItemName = document.getElementById('inputItemName');
    this.inputItemAmount = document.getElementById('inputItemAmount');
    this.selectPurchaseCard = document.getElementById('selectPurchaseCard');
    this.btnCalculatePurchase = document.getElementById('btnCalculatePurchase');
    this.purchaseResultCard = document.getElementById('purchaseResultCard');
    this.verdictPill = document.getElementById('verdictPill');
    this.aiRecHighlightText = document.getElementById('aiRecHighlightText');
    this.aiRecReasonText = document.getElementById('aiRecReasonText');
    this.installmentsSimTable = document.getElementById('installmentsSimTable');
    this.metricWorkHours = document.getElementById('metricWorkHours');
    this.metricLimitImpact = document.getElementById('metricLimitImpact');
    this.metricDailyImpact = document.getElementById('metricDailyImpact');
    this.rationaleText = document.getElementById('rationaleText');
    this.leakItemsList = document.getElementById('leakItemsList');

    // Profile Tab
    this.profileDisplayName = document.getElementById('profileDisplayName');
    this.profileRoleText = document.getElementById('profileRoleText');
    this.profileAvatarText = document.getElementById('profileAvatarText');
    this.profileCardsSummary = document.getElementById('profileCardsSummary');
    this.btnOpenEditProfile = document.getElementById('btnOpenEditProfile');
    this.btnManageCardsProfile = document.getElementById('btnManageCardsProfile');
    this.btnEditDatesProfile = document.getElementById('btnEditDatesProfile');
    this.btnClearTestData = document.getElementById('btnClearTestData');

    // Modal Nova Compra
    this.modalTransaction = document.getElementById('modalTransaction');
    this.btnCloseTxModal = document.getElementById('btnCloseTxModal');
    this.btnCancelTx = document.getElementById('btnCancelTx');
    this.btnSaveTx = document.getElementById('btnSaveTx');
    this.txDescription = document.getElementById('txDescription');
    this.txAmount = document.getElementById('txAmount');
    this.txCategory = document.getElementById('txCategory');
    this.txAccount = document.getElementById('txAccount');
    this.txDate = document.getElementById('txDate');
    this.planSingle = document.getElementById('planSingle');
    this.planInstallment = document.getElementById('planInstallment');
    this.groupInstallmentCount = document.getElementById('groupInstallmentCount');
    this.txInstallments = document.getElementById('txInstallments');
    this.installmentCalcPreview = document.getElementById('installmentCalcPreview');

    // Modal Onboarding (Wizard 3 Etapas)
    this.modalOnboarding = document.getElementById('modalOnboarding');
    this.btnCloseOnboardingModal = document.getElementById('btnCloseOnboardingModal');
    this.onboardingModalTitle = document.getElementById('onboardingModalTitle');
    this.onboardingModalSub = document.getElementById('onboardingModalSub');
    this.stepPill1 = document.getElementById('stepPill1');
    this.stepPill2 = document.getElementById('stepPill2');
    this.stepPill3 = document.getElementById('stepPill3');
    this.onboardingStep1 = document.getElementById('onboardingStep1');
    this.onboardingStep2 = document.getElementById('onboardingStep2');
    this.onboardingStep3 = document.getElementById('onboardingStep3');
    this.btnNextStep1 = document.getElementById('btnNextStep1');
    this.btnPrevStep2 = document.getElementById('btnPrevStep2');
    this.btnNextStep2 = document.getElementById('btnNextStep2');
    this.btnPrevStep3 = document.getElementById('btnPrevStep3');
    this.btnSaveOnboardingAll = document.getElementById('btnSaveOnboardingAll');
    this.obCardsContainer = document.getElementById('obCardsContainer');
    this.btnAddCardItem = document.getElementById('btnAddCardItem');
    this.obUserName = document.getElementById('obUserName');
    this.obNetIncome = document.getElementById('obNetIncome');
    this.obSalaryDay = document.getElementById('obSalaryDay');
    this.obWorkHours = document.getElementById('obWorkHours');
    this.obFixedExpensesDay = document.getElementById('obFixedExpensesDay');
    this.obCheckingBalance = document.getElementById('obCheckingBalance');
    this.obInvestmentsBalance = document.getElementById('obInvestmentsBalance');

    // Modal AI Config
    this.modalConfigAI = document.getElementById('modalConfigAI');
    this.btnCloseConfigModal = document.getElementById('btnCloseConfigModal');
    this.btnSaveApiKey = document.getElementById('btnSaveApiKey');
    this.btnClearApiKey = document.getElementById('btnClearApiKey');
    this.inputApiKey = document.getElementById('inputApiKey');

    // Dynamic Island & Toasts
    this.phoneDynamicIsland = document.querySelector('.phone-dynamic-island');
    this.islandNotification = document.getElementById('islandNotification');
    this.islandText = document.getElementById('islandText');
    this.toastContainer = document.getElementById('toastContainer');
  }

  // ===========================================================================
  // AUTHENTICATION & SUPABASE LIFECYCLE
  // ===========================================================================
  async initSession() {
    if (!this.supabase) {
      this.showAppView();
      this.renderAll();
      return;
    }

    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (session && session.user) {
        this.currentUser = session.user;
        await this.loadUserData(session.user);
        this.showAppView();
      } else {
        this.showAuthView();
      }

      this.supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
          this.currentUser = session.user;
          await this.loadUserData(session.user);
          this.showAppView();
        } else {
          this.currentUser = null;
          this.showAuthView();
        }
      });
    } catch (e) {
      console.error('Erro ao verificar sessão Supabase:', e);
      this.showAuthView();
    }
  }

  showAuthView() {
    if (this.authScreen) this.authScreen.classList.remove('hidden');
    if (this.appMainView) this.appMainView.classList.add('hidden');
  }

  showAppView() {
    if (this.authScreen) this.authScreen.classList.add('hidden');
    if (this.appMainView) this.appMainView.classList.remove('hidden');
    this.renderAll();
  }

  bindAuthEvents() {
    if (this.btnAuthTabLogin) {
      this.btnAuthTabLogin.addEventListener('click', () => {
        this.authMode = 'login';
        this.btnAuthTabLogin.classList.add('active');
        this.btnAuthTabSignup.classList.remove('active');
        if (this.groupSignupName) this.groupSignupName.classList.add('hidden');
        if (this.btnSubmitAuthText) this.btnSubmitAuthText.textContent = 'Entrar no Aura Wealth';
        this.hideAuthError();
      });
    }

    if (this.btnAuthTabSignup) {
      this.btnAuthTabSignup.addEventListener('click', () => {
        this.authMode = 'signup';
        this.btnAuthTabSignup.classList.add('active');
        this.btnAuthTabLogin.classList.remove('active');
        if (this.groupSignupName) this.groupSignupName.classList.remove('hidden');
        if (this.btnSubmitAuthText) this.btnSubmitAuthText.textContent = 'Cadastrar no Aura Wealth';
        this.hideAuthError();
      });
    }

    if (this.formAuth) {
      this.formAuth.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAuthSubmit();
      });
    }

    if (this.btnSubmitAuth) {
      this.btnSubmitAuth.addEventListener('click', () => {
        this.handleAuthSubmit();
      });
    }

    if (this.btnLogoutUser) {
      this.btnLogoutUser.addEventListener('click', async () => {
        if (!confirm('Deseja realmente sair da sua conta no Aura Wealth?')) return;
        if (this.supabase) {
          await this.supabase.auth.signOut();
        }
        this.showToast('Você saiu da sua conta.');
        this.showAuthView();
      });
    }
  }

  async handleAuthSubmit() {
    const email = (this.authEmail?.value || '').trim();
    const password = (this.authPassword?.value || '').trim();
    const name = (this.authName?.value || '').trim();

    if (!email || !password) {
      this.showAuthError('Por favor, informe e-mail e senha.');
      return;
    }

    if (password.length < 6) {
      this.showAuthError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    this.hideAuthError();
    if (this.btnSubmitAuth) this.btnSubmitAuth.disabled = true;
    if (this.btnSubmitAuthText) this.btnSubmitAuthText.textContent = 'Processando...';

    try {
      if (this.authMode === 'login') {
        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const msg = error.message.includes('Invalid login credentials')
            ? 'E-mail ou senha incorretos. Verifique e tente novamente.'
            : error.message;
          this.showAuthError(msg);
        } else if (data.session) {
          this.showToast('Login realizado com sucesso! Bem-vindo.');
        }
      } else {
        const displayName = name || 'Membro Aura';
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: displayName }
          }
        });

        if (error) {
          this.showAuthError(error.message);
        } else if (data.user && !data.session) {
          this.showAuthSuccess('Conta criada com sucesso! Faça login para continuar.');
        } else if (data.session) {
          this.showToast(`Conta criada com sucesso! Bem-vindo, ${displayName.split(' ')[0]}!`);
          this.openOnboardingModal();
        }
      }
    } catch (err) {
      this.showAuthError('Erro de conexão com o servidor. Tente novamente.');
      console.error(err);
    } finally {
      if (this.btnSubmitAuth) this.btnSubmitAuth.disabled = false;
      if (this.btnSubmitAuthText) {
        this.btnSubmitAuthText.textContent = this.authMode === 'login' ? 'Entrar no Aura Wealth' : 'Cadastrar no Aura Wealth';
      }
    }
  }

  showAuthError(msg) {
    if (!this.authErrorMessage) return;
    this.authErrorMessage.className = 'auth-error-msg';
    this.authErrorMessage.textContent = msg;
    this.authErrorMessage.classList.remove('hidden');
  }

  showAuthSuccess(msg) {
    if (!this.authErrorMessage) return;
    this.authErrorMessage.className = 'auth-success-msg';
    this.authErrorMessage.textContent = msg;
    this.authErrorMessage.classList.remove('hidden');
  }

  hideAuthError() {
    if (this.authErrorMessage) {
      this.authErrorMessage.classList.add('hidden');
      this.authErrorMessage.textContent = '';
    }
  }

  // ===========================================================================
  // DATA SYNC WITH SUPABASE
  // ===========================================================================
  async loadUserData(user) {
    if (!this.supabase || !user) return;
    const userId = user.id;
    const userEmail = user.email || '';
    const userMeta = user.user_metadata || {};

    if (this.profileEmailSubtitle) {
      this.profileEmailSubtitle.textContent = userEmail;
    }

    try {
      // 1. Perfil
      let { data: profile } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!profile) {
        const rawName = userMeta.name || userEmail.split('@')[0];
        const newProfile = {
          id: userId,
          name: rawName,
          role: 'MEMBRO AURA',
          monthly_net_income: 0.00,
          hourly_wage: 0.00
        };
        await this.supabase.from('profiles').insert(newProfile);
        profile = newProfile;
      }

      const userName = profile.name || 'Membro Aura';
      const parts = userName.split(' ').filter(p => p.length > 0);
      const initials = parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : userName.substring(0, 2).toUpperCase();

      this.store.state.user = {
        id: userId,
        email: userEmail,
        name: userName,
        role: profile.role || 'MEMBRO AURA',
        avatar: initials,
        monthlyNetIncome: parseFloat(profile.monthly_net_income || 0),
        salaryDay: profile.salary_day || 5,
        fixedExpensesDay: profile.fixed_expenses_day || 10,
        workHoursPerMonth: 160,
        hourlyWage: parseFloat(profile.hourly_wage || 0),
        geminiApiKey: ''
      };

      // 2. Contas & Cartões
      let { data: accounts } = await this.supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: true });

      if (!accounts || accounts.length === 0) {
        const initialAccounts = [
          { user_id: userId, name: 'Conta Corrente', type: 'CHECKING', balance: 0.00 },
          { user_id: userId, name: 'Cartão Nubank', type: 'CREDIT_CARD', balance: 0.00 }
        ];
        const { data: insertedAccounts } = await this.supabase.from('accounts').insert(initialAccounts).select();
        accounts = insertedAccounts || initialAccounts;
      }

      // Separa contas correntes/investimentos de cartões de crédito
      const bankAccounts = [];
      const creditCards = [];

      accounts.forEach(a => {
        if (a.type === 'CREDIT_CARD') {
          creditCards.push({
            id: a.id,
            name: a.name,
            creditLimit: parseFloat(a.credit_limit || 5000),
            balance: Math.abs(parseFloat(a.balance || 0)),
            closingDay: a.closing_day || 8,
            dueDay: a.due_day || 15
          });
        } else {
          bankAccounts.push({
            id: a.id,
            name: a.name,
            type: a.type,
            balance: parseFloat(a.balance || 0),
            dotClass: a.type === 'CHECKING' ? 'nu' : 'inter'
          });
        }
      });

      this.store.state.accounts = bankAccounts;
      this.store.state.cards = creditCards;

      // 3. Transações
      let { data: transactions } = await this.supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      this.store.state.transactions = (transactions || []).map(t => {
        const isIncome = t.direction === 'INFLOW' || parseFloat(t.amount) > 0;
        return {
          id: t.id,
          description: t.description,
          cleanMerchant: t.description,
          amount: parseFloat(t.amount),
          direction: t.direction,
          category: t.category,
          categoryLabel: isIncome ? 'RECEITA' : (t.category ? t.category.replace('needs_', '').replace('wants_', '').toUpperCase() : 'COMPRA'),
          dateLabel: 'RECENTE',
          account: t.account_name || 'Cartão',
          accountType: t.account_type || (t.account_name && t.account_name.toLowerCase().includes('cartão') ? 'CREDIT_CARD' : 'CHECKING'),
          method: t.payment_method || 'CREDIT_CARD',
          installments: t.installments || 1,
          date: t.created_at || new Date().toISOString()
        };
      });

      this.store.recalculateForecast();
      this.store.persist();
      this.renderAll();
    } catch (err) {
      console.error('Erro sincronizando dados do Supabase:', err);
    }
  }

  // ===========================================================================
  // DOM EVENT LISTENERS
  // ===========================================================================
  bindEvents() {
    if (this.btnViewMobile) this.btnViewMobile.addEventListener('click', () => this.switchViewMode('mobile'));
    if (this.btnViewDesktop) this.btnViewDesktop.addEventListener('click', () => this.switchViewMode('desktop'));

    this.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab, btn);
      });
    });

    // Ações de Abrir Nova Compra
    if (this.btnHeaderAdd) this.btnHeaderAdd.addEventListener('click', () => this.openTransactionModal());
    if (this.btnNewTransaction) this.btnNewTransaction.addEventListener('click', () => this.openTransactionModal());
    if (this.btnQuickAddPurchase) this.btnQuickAddPurchase.addEventListener('click', () => this.openTransactionModal());

    // Ações de Onboarding / Gerenciar Cartões
    if (this.btnHeaderOnboarding) this.btnHeaderOnboarding.addEventListener('click', () => this.openOnboardingModal());
    if (this.btnOpenOnboarding) this.btnOpenOnboarding.addEventListener('click', () => this.openOnboardingModal());
    if (this.btnManageCards) this.btnManageCards.addEventListener('click', () => this.openOnboardingModal(2));
    if (this.btnManageCardsProfile) this.btnManageCardsProfile.addEventListener('click', () => this.openOnboardingModal(2));
    if (this.btnEditDatesProfile) this.btnEditDatesProfile.addEventListener('click', () => this.openOnboardingModal(1));
    if (this.btnQuickAdjustReal) this.btnQuickAdjustReal.addEventListener('click', () => this.openOnboardingModal(1));
    if (this.btnOpenEditProfile) this.btnOpenEditProfile.addEventListener('click', () => this.openOnboardingModal(1));

    // Zerar Dados
    if (this.btnClearTestData) this.btnClearTestData.addEventListener('click', () => this.clearTestDataAndReset());

    // Futurômetro Slider
    if (this.simulatorSlider) {
      this.simulatorSlider.addEventListener('input', (e) => this.onSliderSimulate(e.target.value));
    }

    // FinAI Calculator
    if (this.btnCalculatePurchase) {
      this.btnCalculatePurchase.addEventListener('click', () => this.handleCalculatePurchase());
    }

    // Modals: Compra Manual
    if (this.btnCloseTxModal) this.btnCloseTxModal.addEventListener('click', () => this.closeTransactionModal());
    if (this.btnCancelTx) this.btnCancelTx.addEventListener('click', () => this.closeTransactionModal());
    if (this.btnSaveTx) this.btnSaveTx.addEventListener('click', () => this.handleSaveTransaction());

    // Alternância de Parcelamento no Modal de Compra
    if (this.planSingle && this.planInstallment) {
      this.planSingle.addEventListener('change', () => {
        if (this.groupInstallmentCount) this.groupInstallmentCount.classList.add('hidden');
      });
      this.planInstallment.addEventListener('change', () => {
        if (this.groupInstallmentCount) this.groupInstallmentCount.classList.remove('hidden');
        this.updateInstallmentPreview();
      });
    }

    if (this.txAmount && this.txInstallments) {
      this.txAmount.addEventListener('input', () => this.updateInstallmentPreview());
      this.txInstallments.addEventListener('change', () => this.updateInstallmentPreview());
    }

    // Modals: Onboarding Wizard
    if (this.btnCloseOnboardingModal) this.btnCloseOnboardingModal.addEventListener('click', () => this.closeOnboardingModal());
    if (this.btnNextStep1) this.btnNextStep1.addEventListener('click', () => this.goToOnboardingStep(2));
    if (this.btnPrevStep2) this.btnPrevStep2.addEventListener('click', () => this.goToOnboardingStep(1));
    if (this.btnNextStep2) this.btnNextStep2.addEventListener('click', () => this.goToOnboardingStep(3));
    if (this.btnPrevStep3) this.btnPrevStep3.addEventListener('click', () => this.goToOnboardingStep(2));
    if (this.btnAddCardItem) this.btnAddCardItem.addEventListener('click', () => this.addCardItemRow());
    if (this.btnSaveOnboardingAll) this.btnSaveOnboardingAll.addEventListener('click', () => this.saveOnboardingData());

    // Modals: AI Config
    if (this.btnConfigAI) this.btnConfigAI.addEventListener('click', () => this.openConfigModal());
    if (this.btnCloseConfigModal) this.btnCloseConfigModal.addEventListener('click', () => this.closeConfigModal());
    if (this.btnSaveApiKey) this.btnSaveApiKey.addEventListener('click', () => this.saveApiKey());
    if (this.btnClearApiKey) this.btnClearApiKey.addEventListener('click', () => this.clearApiKey());
  }

  // ===========================================================================
  // RENDERING ENGINE
  // ===========================================================================
  renderAll() {
    this.renderHeaderBalances();
    this.renderCardsOverview();
    this.renderTransactions();
    this.renderFuturo();
    this.renderProfile();
    this.populateCardSelects();
  }

  formatCurrency(val) {
    const num = isNaN(val) ? 0 : val;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  renderHeaderBalances() {
    const checkingBalance = this.store.state.accounts
      .filter(a => a.type === 'CHECKING' || a.type === 'INVESTMENT')
      .reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

    const totalInvoices = this.store.state.cards.reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);
    const netLiquid = checkingBalance - totalInvoices;

    if (this.totalLiquidBalance) {
      this.totalLiquidBalance.textContent = this.formatCurrency(netLiquid);
    }
    if (this.monthInflowTotal) {
      this.monthInflowTotal.textContent = `+ R$ ${this.formatCurrency(this.store.state.forecast.inflowTotal)}`;
    }
    if (this.monthOutflowTotal) {
      this.monthOutflowTotal.textContent = `- R$ ${this.formatCurrency(this.store.state.forecast.outflowTotal)}`;
    }
  }

  renderCardsOverview() {
    const cards = this.store.state.cards || [];
    const totalLimit = cards.reduce((sum, c) => sum + (parseFloat(c.creditLimit) || 0), 0);
    const totalInvoices = cards.reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);
    const available = Math.max(0, totalLimit - totalInvoices);

    if (this.totalCreditLimit) this.totalCreditLimit.textContent = `R$ ${this.formatCurrency(totalLimit)}`;
    if (this.totalCurrentInvoice) this.totalCurrentInvoice.textContent = `R$ ${this.formatCurrency(totalInvoices)}`;
    if (this.totalAvailableLimit) this.totalAvailableLimit.textContent = `R$ ${this.formatCurrency(available)}`;

    if (!this.cardsMiniList) return;

    if (cards.length === 0) {
      this.cardsMiniList.innerHTML = `
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #94A3B8;">
          Nenhum cartão cadastrado. Clique em "Configurar" para adicionar seus cartões.
        </div>
      `;
      return;
    }

    const todayDay = new Date().getDate();
    let html = '';
    cards.forEach(c => {
      const dueDay = c.dueDay || 15;
      let dueText = `Vence dia ${dueDay}`;
      if (dueDay >= todayDay) {
        dueText = `Vence em ${dueDay - todayDay} dias (dia ${dueDay})`;
      } else {
        dueText = `Vencimento dia ${dueDay}`;
      }

      html += `
        <div class="card-mini-row">
          <div>
            <div class="card-mini-title">💳 ${escapeHTML(c.name)}</div>
            <div class="card-mini-sub">Limite: R$ ${this.formatCurrency(c.creditLimit)} • ${dueText}</div>
          </div>
          <div class="card-mini-invoice">
            Fatura: R$ ${this.formatCurrency(c.balance)}
          </div>
        </div>
      `;
    });

    this.cardsMiniList.innerHTML = html;
  }

  renderTransactions() {
    if (!this.transactionListContainer) return;

    let html = '';
    const txs = this.store.state.transactions.slice(0, 10);

    if (txs.length === 0) {
      this.transactionListContainer.innerHTML = `
        <div class="wealth-empty-state">
          <div class="empty-icon">🛒</div>
          <div class="empty-title">Nenhuma compra registrada ainda</div>
          <p class="empty-desc">Clique no botão "+ Registrar Compra" para lançar compras manuais nos seus cartões ou débito.</p>
        </div>
      `;
      return;
    }

    txs.forEach(tx => {
      const isIncome = tx.direction === 'INFLOW' || tx.amount > 0;
      const amountSign = isIncome ? '+ R$' : '- R$';
      const amountClass = isIncome ? 'style="color: #00F090;"' : '';
      const installmentLabel = (tx.installments && tx.installments > 1) ? ` (${tx.installments}x)` : '';

      html += `
        <div class="wealth-tx-item">
          <div class="wealth-tx-left">
            <div class="wealth-tx-icon-circle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </div>
            <div>
              <div class="wealth-tx-name">${escapeHTML(tx.description)}</div>
              <div class="wealth-tx-meta">${escapeHTML(tx.account || 'Cartão')}${installmentLabel} • ${escapeHTML(tx.categoryLabel || 'COMPRA')}</div>
            </div>
          </div>
          <div class="wealth-tx-amount" ${amountClass}>
            ${amountSign} ${this.formatCurrency(Math.abs(tx.amount))}
          </div>
        </div>
      `;
    });

    this.transactionListContainer.innerHTML = html;
  }

  renderFuturo() {
    if (this.futuroClosingAmount) {
      this.futuroClosingAmount.textContent = this.formatCurrency(this.store.state.forecast.projectedClosingBalance);
    }
    if (this.safeDailyValue) {
      this.safeDailyValue.textContent = `R$ ${this.formatCurrency(this.store.state.forecast.safeDailySpend)} /`;
    }
    if (this.simulatorSlider) {
      const safe = Math.round(this.store.state.forecast.safeDailySpend);
      this.simulatorSlider.min = Math.max(10, Math.round(safe * 0.2));
      this.simulatorSlider.max = Math.max(100, Math.round(safe * 2.5));
      this.simulatorSlider.value = safe;
    }
  }

  onSliderSimulate(val) {
    const daily = parseFloat(val) || 0;
    if (this.safeDailyValue) {
      this.safeDailyValue.textContent = `R$ ${this.formatCurrency(daily)} /`;
    }
    const days = this.store.state.forecast.daysRemaining || getDaysRemainingInMonth();
    const checkingBalance = this.store.state.accounts
      .filter(a => a.type === 'CHECKING' || a.type === 'INVESTMENT')
      .reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
    const totalInvoices = this.store.state.cards.reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);
    const totalLiquid = checkingBalance - totalInvoices;

    const monthlyNet = parseFloat(this.store.state.user.monthlyNetIncome) || 0;
    const inflow = this.store.state.forecast.inflowTotal || 0;
    const pendingIncome = Math.max(0, monthlyNet - inflow);

    const simulatedClosing = totalLiquid + pendingIncome - (daily * days);
    if (this.futuroClosingAmount) {
      this.futuroClosingAmount.textContent = this.formatCurrency(simulatedClosing);
    }
  }

  renderProfile() {
    const user = this.store.state.user;
    if (this.profileDisplayName) this.profileDisplayName.textContent = user.name || 'Membro Aura';
    if (this.profileRoleText) this.profileRoleText.textContent = user.role || 'MEMBRO AURA';
    if (this.profileAvatarText) this.profileAvatarText.textContent = user.avatar || 'MA';
    if (this.profileCardsSummary) {
      const count = (this.store.state.cards || []).length;
      this.profileCardsSummary.textContent = `${count} cartão(ões) de crédito cadastrado(s)`;
    }
  }

  populateCardSelects() {
    const cards = this.store.state.cards || [];
    const accounts = this.store.state.accounts || [];

    // Preenche select do modal de compra
    if (this.txAccount) {
      let options = '';
      cards.forEach(c => {
        const avail = Math.max(0, (c.creditLimit || 5000) - (c.balance || 0));
        options += `<option value="${escapeHTML(c.name)}" data-type="CREDIT_CARD" data-id="${c.id}">💳 ${escapeHTML(c.name)} (Disp: R$ ${this.formatCurrency(avail)})</option>`;
      });

      accounts.forEach(a => {
        options += `<option value="${escapeHTML(a.name)}" data-type="${a.type}" data-id="${a.id}">🏦 ${escapeHTML(a.name)} (Saldo: R$ ${this.formatCurrency(a.balance)})</option>`;
      });

      this.txAccount.innerHTML = options;
    }

    // Preenche select do simulador FinAI
    if (this.selectPurchaseCard) {
      let options = '';
      cards.forEach(c => {
        options += `<option value="${escapeHTML(c.name)}" data-id="${c.id}">${escapeHTML(c.name)} (Limite R$ ${this.formatCurrency(c.creditLimit)})</option>`;
      });
      if (cards.length === 0) {
        options = '<option value="">Nenhum cartão cadastrado</option>';
      }
      this.selectPurchaseCard.innerHTML = options;
    }
  }

  // ===========================================================================
  // MODAL NOVA COMPRA (LANÇAMENTO MANUAL DIRETO)
  // ===========================================================================
  openTransactionModal() {
    if (this.modalTransaction) {
      this.populateCardSelects();
      if (this.txDate) this.txDate.valueAsDate = new Date();
      this.modalTransaction.classList.remove('hidden');
      this.txDescription?.focus();
    }
  }

  closeTransactionModal() {
    if (this.modalTransaction) {
      this.modalTransaction.classList.add('hidden');
      this.txDescription.value = '';
      this.txAmount.value = '';
      if (this.planSingle) this.planSingle.checked = true;
      if (this.groupInstallmentCount) this.groupInstallmentCount.classList.add('hidden');
    }
  }

  updateInstallmentPreview() {
    const val = parseFloat(this.txAmount?.value) || 0;
    const installments = parseInt(this.txInstallments?.value) || 1;
    if (val > 0 && installments > 1) {
      const part = val / installments;
      if (this.installmentCalcPreview) {
        this.installmentCalcPreview.textContent = `${installments}x de R$ ${this.formatCurrency(part)}`;
      }
    }
  }

  async handleSaveTransaction() {
    const desc = (this.txDescription?.value || '').trim();
    const amountVal = parseFloat(this.txAmount?.value);
    const category = this.txCategory?.value || 'other';
    const accountName = this.txAccount?.value || 'Cartão';
    const selectedOption = this.txAccount?.selectedOptions[0];
    const accountType = selectedOption?.getAttribute('data-type') || 'CREDIT_CARD';
    const accountId = selectedOption?.getAttribute('data-id') || null;

    const isInstallment = this.planInstallment?.checked;
    const installments = isInstallment ? (parseInt(this.txInstallments?.value) || 1) : 1;

    if (!desc || isNaN(amountVal) || amountVal <= 0) {
      alert('Por favor, informe o que comprou e o valor válido.');
      return;
    }

    const newTx = {
      id: 'tx_' + Date.now(),
      description: desc,
      cleanMerchant: desc,
      amount: -amountVal,
      direction: 'OUTFLOW',
      category: category,
      categoryLabel: category.replace('needs_', '').replace('wants_', '').toUpperCase(),
      account: accountName,
      accountType: accountType,
      cardId: accountId,
      installments: installments,
      date: this.txDate?.value || new Date().toISOString()
    };

    this.store.addTransaction(newTx);
    this.closeTransactionModal();
    this.renderAll();

    // Notificação visual na ilha dinâmica
    if (this.phoneDynamicIsland) this.phoneDynamicIsland.classList.add('expanded');
    if (this.islandNotification) this.islandNotification.style.display = 'flex';
    if (this.islandText) this.islandText.textContent = `Compra: R$ ${this.formatCurrency(amountVal)} no ${accountName}`;

    setTimeout(() => {
      if (this.phoneDynamicIsland) this.phoneDynamicIsland.classList.remove('expanded');
      if (this.islandNotification) this.islandNotification.style.display = 'none';
    }, 2800);

    this.showToast(`Compra de R$ ${this.formatCurrency(amountVal)} registrada com sucesso!`);

    // Persistência no Supabase
    if (this.supabase && this.currentUser) {
      try {
        await this.supabase.from('transactions').insert({
          user_id: this.currentUser.id,
          account_name: accountName,
          description: desc,
          amount: -amountVal,
          direction: 'OUTFLOW',
          category: category,
          payment_method: accountType === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'DEBIT_CARD'
        });

        // Se for cartão, atualiza a fatura no banco
        if (accountType === 'CREDIT_CARD' && accountId) {
          const targetCard = this.store.state.cards.find(c => c.id === accountId);
          if (targetCard) {
            await this.supabase.from('accounts').update({ balance: targetCard.balance }).eq('id', accountId);
          }
        }
      } catch (err) {
        console.error('Erro salvando no Supabase:', err);
      }
    }
  }

  // ===========================================================================
  // FINAI: SIMULADOR DE PARCELAMENTO SAUDÁVEL
  // "Quero comprar algo, mas parcelo em quantas vezes?? Esse valor é saudável pra mim??"
  // ===========================================================================
  handleCalculatePurchase() {
    const itemName = (this.inputItemName?.value || '').trim();
    const itemAmount = parseFloat(this.inputItemAmount?.value);

    if (!itemName || isNaN(itemAmount) || itemAmount <= 0) {
      alert('Por favor, informe o que deseja comprar e o valor total.');
      return;
    }

    const netIncome = this.store.state.user.monthlyNetIncome || 0;
    const workHoursPerMonth = this.store.state.user.workHoursPerMonth || 160;
    const hourlyWage = (netIncome > 0 && workHoursPerMonth > 0) ? (netIncome / workHoursPerMonth) : 0;

    let workHoursText = 'Defina sua renda';
    let hoursPart = 0;
    let minutesPart = 0;
    if (hourlyWage > 0) {
      const workHours = itemAmount / hourlyWage;
      hoursPart = Math.floor(workHours);
      minutesPart = Math.round((workHours - hoursPart) * 60);
      workHoursText = `${hoursPart}h ${minutesPart}min`;
    }

    const safeDaily = this.store.state.forecast.safeDailySpend || 0;
    const days = this.store.state.forecast.daysRemaining || getDaysRemainingInMonth();
    const remainingMargin = safeDaily * days;

    // Cartão selecionado
    const cardName = this.selectPurchaseCard?.value || 'Cartão';
    const targetCard = (this.store.state.cards || []).find(c => c.name === cardName);
    const cardLimit = targetCard ? (targetCard.creditLimit || 5000) : 5000;
    const cardInvoice = targetCard ? (targetCard.balance || 0) : 0;
    const limitAvailable = Math.max(0, cardLimit - cardInvoice);

    const limitImpactPct = cardLimit > 0 ? ((itemAmount / cardLimit) * 100).toFixed(1) : 0;

    if (this.metricWorkHours) this.metricWorkHours.textContent = workHoursText;
    if (this.metricLimitImpact) this.metricLimitImpact.textContent = `${limitImpactPct}%`;

    const impactOnDaily = (itemAmount / days).toFixed(2);
    const newDaily = Math.max(0, safeDaily - (itemAmount / days)).toFixed(2);
    if (this.metricDailyImpact) this.metricDailyImpact.textContent = `R$ ${this.formatCurrency(parseFloat(newDaily))}`;

    // Gera tabela comparativa de 1x até 12x
    const optionsToSimulate = [1, 2, 3, 4, 6, 8, 10, 12];
    let recommendedCount = 1;
    let recHighlight = '';
    let recReason = '';
    let verdictClass = 'verdict-green';
    let verdictText = '🟢 Compra 100% Saudável';

    // Heurística de recomendação inteligente:
    // Se a compra for pequena (menor que 2 dias de gasto seguro ou < R$ 150): prefira 1x ou até 2x
    if (itemAmount <= 150 || (safeDaily > 0 && itemAmount <= safeDaily * 2)) {
      recommendedCount = 1;
      verdictClass = 'verdict-green';
      verdictText = '🟢 Compra Saudável';
      recHighlight = `Pague em 1x à vista (R$ ${this.formatCurrency(itemAmount)})`;
      recReason = `O valor de R$ ${this.formatCurrency(itemAmount)} é baixo em relação à sua renda e cabe tranquilamente no saldo à vista. Se a loja oferecer desconto no PIX, aproveite!`;
    } else {
      // Procura o menor número de parcelas onde a parcela consuma menos de 10% da renda líquida
      let found = false;
      for (const n of optionsToSimulate) {
        const part = itemAmount / n;
        const shareOfIncome = netIncome > 0 ? (part / netIncome) : 0;
        if (shareOfIncome <= 0.08 || part <= (safeDaily * 3)) {
          recommendedCount = n;
          found = true;
          break;
        }
      }
      if (!found) recommendedCount = 10;

      const recPart = itemAmount / recommendedCount;
      if (itemAmount > limitAvailable) {
        verdictClass = 'verdict-red';
        verdictText = '🔴 Risco de Estouro de Limite';
        recHighlight = `Atenção: Limite insuficiente no ${cardName}`;
        recReason = `Esta compra de R$ ${this.formatCurrency(itemAmount)} ultrapassa o limite disponível atual de R$ ${this.formatCurrency(limitAvailable)}. Reduza o valor ou utilize outro cartão.`;
      } else if (netIncome > 0 && itemAmount > (netIncome * 0.5)) {
        verdictClass = 'verdict-yellow';
        verdictText = '🟡 Requer Atenção';
        recHighlight = `Parcele em até ${recommendedCount}x de R$ ${this.formatCurrency(recPart)}`;
        recReason = `Essa compra compromete parte expressiva da sua renda. Em ${recommendedCount}x sem juros, o impacto mensal será de apenas R$ ${this.formatCurrency(recPart)}/mês, preservando suas próximas faturas.`;
      } else {
        verdictClass = 'verdict-green';
        verdictText = '🟢 Parcelamento Saudável';
        recHighlight = `Parcele em até ${recommendedCount}x de R$ ${this.formatCurrency(recPart)}`;
        recReason = `Diluir em ${recommendedCount}x sem juros mantém seu gasto diário seguro no verde sem sufocar o vencimento do cartão dia ${targetCard?.dueDay || 15}.`;
      }
    }

    if (this.aiRecHighlightText) this.aiRecHighlightText.textContent = recHighlight;
    if (this.aiRecReasonText) this.aiRecReasonText.textContent = recReason;

    // Renderiza a tabela de simulação
    let tableHtml = '';
    optionsToSimulate.forEach(n => {
      const partVal = itemAmount / n;
      const shareOfMargin = remainingMargin > 0 ? ((partVal / remainingMargin) * 100).toFixed(0) : 0;
      const isRec = n === recommendedCount;

      let badgeClass = 'healthy';
      let badgeLabel = 'Saudável';
      if (shareOfMargin > 30) {
        badgeClass = 'danger';
        badgeLabel = 'Pesado';
      } else if (shareOfMargin > 15) {
        badgeClass = 'caution';
        badgeLabel = 'Moderado';
      }

      tableHtml += `
        <div class="sim-row ${isRec ? 'recommended' : ''}">
          <div class="sim-left">
            ${n}x de R$ ${this.formatCurrency(partVal)} ${isRec ? '⭐ <strong>Ideal</strong>' : ''}
          </div>
          <div class="sim-right">
            <span class="sim-share">${shareOfMargin}% da margem</span>
            <span class="sim-badge ${badgeClass}">${badgeLabel}</span>
          </div>
        </div>
      `;
    });

    if (this.installmentsSimTable) {
      this.installmentsSimTable.innerHTML = tableHtml;
    }

    // Rationale comportamental
    const cleanItemName = escapeHTML(itemName);
    let rationale = `A compra de "<strong>${cleanItemName}</strong>" (R$ ${this.formatCurrency(itemAmount)}) equivale a <strong>${hoursPart}h e ${minutesPart}min de esforço</strong> do seu trabalho. `;
    if (recommendedCount > 1) {
      rationale += `Optando por <strong>${recommendedCount} parcelas de R$ ${this.formatCurrency(itemAmount / recommendedCount)}</strong>, sua fatura com vencimento em ${targetCard?.dueDay || 15} permanecerá dentro do limite e seu caixa diário não sofrerá aperto repentino.`;
    } else {
      rationale += `Como o valor é saudável para o seu padrão mensal, quitar à vista elimina dívidas futuras e mantém sua mente livre.`;
    }

    if (this.rationaleText) this.rationaleText.innerHTML = rationale;
    if (this.verdictPill) {
      this.verdictPill.className = 'verdict-pill ' + verdictClass;
      this.verdictPill.textContent = verdictText;
    }

    if (this.purchaseResultCard) {
      this.purchaseResultCard.classList.remove('hidden');
    }
  }

  // ===========================================================================
  // ONBOARDING WIZARD (3 ETAPAS: RENDA, CARTÕES & LIMITES, SALDOS)
  // ===========================================================================
  openOnboardingModal(initialStep = 1) {
    if (!this.modalOnboarding) return;
    this.goToOnboardingStep(initialStep);

    // Preenche etapa 1
    const user = this.store.state.user;
    if (this.obUserName) this.obUserName.value = user.name || '';
    if (this.obNetIncome) this.obNetIncome.value = user.monthlyNetIncome || '';
    if (this.obSalaryDay) this.obSalaryDay.value = user.salaryDay || 5;
    if (this.obWorkHours) this.obWorkHours.value = user.workHoursPerMonth || 160;
    if (this.obFixedExpensesDay) this.obFixedExpensesDay.value = user.fixedExpensesDay || 10;

    // Preenche etapa 2: Cartões
    this.renderOnboardingCardItems();

    // Preenche etapa 3: Saldos
    const checking = this.store.state.accounts.find(a => a.type === 'CHECKING');
    const invest = this.store.state.accounts.find(a => a.type === 'INVESTMENT');
    if (this.obCheckingBalance) this.obCheckingBalance.value = checking ? checking.balance : '';
    if (this.obInvestmentsBalance) this.obInvestmentsBalance.value = invest ? invest.balance : '';

    this.modalOnboarding.classList.remove('hidden');
  }

  closeOnboardingModal() {
    if (this.modalOnboarding) {
      this.modalOnboarding.classList.add('hidden');
    }
  }

  goToOnboardingStep(step) {
    this.currentOnboardingStep = step;
    if (this.onboardingStep1) this.onboardingStep1.classList.toggle('hidden', step !== 1);
    if (this.onboardingStep2) this.onboardingStep2.classList.toggle('hidden', step !== 2);
    if (this.onboardingStep3) this.onboardingStep3.classList.toggle('hidden', step !== 3);

    if (this.stepPill1) {
      this.stepPill1.className = step === 1 ? 'step-indicator active' : (step > 1 ? 'step-indicator done' : 'step-indicator');
    }
    if (this.stepPill2) {
      this.stepPill2.className = step === 2 ? 'step-indicator active' : (step > 2 ? 'step-indicator done' : 'step-indicator');
    }
    if (this.stepPill3) {
      this.stepPill3.className = step === 3 ? 'step-indicator active' : 'step-indicator';
    }

    if (this.onboardingModalSub) {
      const titles = ['', 'Etapa 1 de 3: Renda & Datas', 'Etapa 2 de 3: Cartões, Limites & Vencimentos', 'Etapa 3 de 3: Saldos Bancários'];
      this.onboardingModalSub.textContent = titles[step] || '';
    }
  }

  renderOnboardingCardItems() {
    if (!this.obCardsContainer) return;
    const cards = this.store.state.cards || [];
    let html = '';

    cards.forEach((c, idx) => {
      html += `
        <div class="ob-card-item" data-index="${idx}">
          <div class="ob-card-item-header">
            <span>💳 Cartão #${idx + 1}</span>
            ${cards.length > 1 ? `<button type="button" class="btn-remove-card-item" onclick="app.removeCardItemRow(${idx})" title="Remover Cartão">&times;</button>` : ''}
          </div>
          <div class="input-group">
            <label>Nome do Cartão (ex: Nubank, Itaú, Inter)</label>
            <input type="text" class="card-input-name wealth-input" value="${escapeHTML(c.name)}" placeholder="Ex: Nubank Roxinho" required>
          </div>
          <div class="input-row-grid">
            <div class="input-group">
              <label>Limite Total (R$)</label>
              <input type="number" class="card-input-limit wealth-input" value="${c.creditLimit || ''}" placeholder="Ex: 5000" step="50" required>
            </div>
            <div class="input-group">
              <label>Fatura Atual (R$)</label>
              <input type="number" class="card-input-balance wealth-input" value="${c.balance || ''}" placeholder="0,00" step="10">
            </div>
          </div>
          <div class="input-row-grid">
            <div class="input-group">
              <label>Dia do Fechamento</label>
              <input type="number" class="card-input-closing wealth-input" value="${c.closingDay || 8}" min="1" max="31">
            </div>
            <div class="input-group">
              <label>Dia do Vencimento</label>
              <input type="number" class="card-input-due wealth-input" value="${c.dueDay || 15}" min="1" max="31">
            </div>
          </div>
        </div>
      `;
    });

    this.obCardsContainer.innerHTML = html;
  }

  addCardItemRow() {
    const cards = this.store.state.cards || [];
    cards.push({
      id: 'card_' + Date.now(),
      name: `Novo Cartão ${cards.length + 1}`,
      creditLimit: 3000.00,
      balance: 0.00,
      closingDay: 8,
      dueDay: 15
    });
    this.renderOnboardingCardItems();
  }

  removeCardItemRow(idx) {
    const cards = this.store.state.cards || [];
    if (cards.length > 1) {
      cards.splice(idx, 1);
      this.renderOnboardingCardItems();
    }
  }

  async saveOnboardingData() {
    // 1. Coleta dados da etapa 1
    const name = (this.obUserName?.value || '').trim() || 'Meu Perfil';
    const netIncome = parseFloat(this.obNetIncome?.value) || 0;
    const salaryDay = parseInt(this.obSalaryDay?.value) || 5;
    const workHours = parseFloat(this.obWorkHours?.value) || 160;
    const fixedDay = parseInt(this.obFixedExpensesDay?.value) || 10;
    const wage = workHours > 0 ? parseFloat((netIncome / workHours).toFixed(2)) : 0;

    const parts = name.split(' ').filter(p => p.length > 0);
    const initials = parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();

    this.store.state.user.name = name;
    this.store.state.user.avatar = initials;
    this.store.state.user.monthlyNetIncome = netIncome;
    this.store.state.user.salaryDay = salaryDay;
    this.store.state.user.fixedExpensesDay = fixedDay;
    this.store.state.user.workHoursPerMonth = workHours;
    this.store.state.user.hourlyWage = wage;

    // 2. Coleta dados da etapa 2 (Cartões)
    const cardElements = document.querySelectorAll('.ob-card-item');
    const updatedCards = [];

    cardElements.forEach((el, index) => {
      const cardName = el.querySelector('.card-input-name')?.value.trim() || `Cartão ${index + 1}`;
      const limit = parseFloat(el.querySelector('.card-input-limit')?.value) || 1000;
      const invoice = parseFloat(el.querySelector('.card-input-balance')?.value) || 0;
      const closing = parseInt(el.querySelector('.card-input-closing')?.value) || 8;
      const due = parseInt(el.querySelector('.card-input-due')?.value) || 15;

      updatedCards.push({
        id: this.store.state.cards[index]?.id || ('card_' + Date.now() + '_' + index),
        name: cardName,
        creditLimit: limit,
        balance: invoice,
        closingDay: closing,
        dueDay: due
      });
    });

    this.store.state.cards = updatedCards;

    // 3. Coleta dados da etapa 3 (Saldos)
    const checkingVal = parseFloat(this.obCheckingBalance?.value) || 0;
    const investVal = parseFloat(this.obInvestmentsBalance?.value) || 0;

    let checkingAcc = this.store.state.accounts.find(a => a.type === 'CHECKING');
    if (!checkingAcc) {
      checkingAcc = { id: 'acc_checking', name: 'Conta Corrente', type: 'CHECKING', balance: checkingVal, dotClass: 'nu' };
      this.store.state.accounts.push(checkingAcc);
    } else {
      checkingAcc.balance = checkingVal;
    }

    let investAcc = this.store.state.accounts.find(a => a.type === 'INVESTMENT');
    if (!investAcc) {
      investAcc = { id: 'acc_invest', name: 'Investimentos & Poupança', type: 'INVESTMENT', balance: investVal, dotClass: 'inter' };
      this.store.state.accounts.push(investAcc);
    } else {
      investAcc.balance = investVal;
    }

    this.store.recalculateForecast();
    this.store.persist();
    this.closeOnboardingModal();
    this.renderAll();
    this.showToast('Configuração salva com sucesso! 🚀');

    // Sincronização com Supabase
    if (this.supabase && this.currentUser) {
      try {
        await this.supabase.from('profiles').upsert({
          id: this.currentUser.id,
          name: name,
          monthly_net_income: netIncome,
          hourly_wage: wage
        });

        // Atualiza conta corrente
        await this.supabase.from('accounts').upsert({
          user_id: this.currentUser.id,
          name: 'Conta Corrente',
          type: 'CHECKING',
          balance: checkingVal
        });

        // Atualiza cartões de crédito
        for (const c of updatedCards) {
          await this.supabase.from('accounts').upsert({
            user_id: this.currentUser.id,
            name: c.name,
            type: 'CREDIT_CARD',
            balance: c.balance
          });
        }
      } catch (e) {
        console.error('Erro salvando onboarding no Supabase:', e);
      }
    }
  }

  // ===========================================================================
  // RESET / LIMPEZA DE DADOS
  // ===========================================================================
  async clearTestDataAndReset() {
    if (!confirm('Deseja limpar todos os dados de teste e configurar seus cartões e saldos reais do zero?')) {
      return;
    }

    if (this.supabase && this.currentUser) {
      try {
        await this.supabase.from('transactions').delete().eq('user_id', this.currentUser.id);
        await this.supabase.from('accounts').update({ balance: 0.00 }).eq('user_id', this.currentUser.id);
      } catch (e) {
        console.error('Erro limpando dados no Supabase:', e);
      }
    }

    this.store.reset();
    localStorage.removeItem('aura_wealth_state');

    this.renderAll();
    this.showToast('Dados de teste removidos! Vamos configurar seus cartões reais.');
    this.openOnboardingModal(1);
  }

  // ===========================================================================
  // AI CONFIG MODAL
  // ===========================================================================
  openConfigModal() {
    if (this.inputApiKey) this.inputApiKey.value = this.store.state.user.geminiApiKey || '';
    if (this.modalConfigAI) this.modalConfigAI.classList.remove('hidden');
  }

  closeConfigModal() {
    if (this.modalConfigAI) this.modalConfigAI.classList.add('hidden');
  }

  saveApiKey() {
    const key = (this.inputApiKey?.value || '').trim();
    this.store.state.user.geminiApiKey = key;
    this.store.persist();
    this.closeConfigModal();
    this.showToast(key ? 'Chave Gemini API salva com sucesso!' : 'Modo local ativado.');
  }

  clearApiKey() {
    this.store.state.user.geminiApiKey = '';
    if (this.inputApiKey) this.inputApiKey.value = '';
    this.store.persist();
    this.closeConfigModal();
    this.showToast('Chave removida.');
  }

  // ===========================================================================
  // NAVIGATION & VIEW SWITCHERS
  // ===========================================================================
  switchViewMode(mode) {
    if (mode === 'desktop') {
      if (this.viewportWrapper) this.viewportWrapper.className = 'app-viewport-wrapper mode-desktop';
      if (this.btnViewDesktop) this.btnViewDesktop.classList.add('active');
      if (this.btnViewMobile) this.btnViewMobile.classList.remove('active');
    } else {
      if (this.viewportWrapper) this.viewportWrapper.className = 'app-viewport-wrapper mode-mobile';
      if (this.btnViewMobile) this.btnViewMobile.classList.add('active');
      if (this.btnViewDesktop) this.btnViewDesktop.classList.remove('active');
    }
  }

  switchTab(targetPanelId, activeBtn) {
    this.tabPanels.forEach(panel => {
      panel.classList.remove('active');
    });

    const target = document.getElementById(targetPanelId);
    if (target) {
      target.classList.add('active');
      const scroller = document.getElementById('tabContentScroll');
      if (scroller) scroller.scrollTop = 0;
    }

    this.navButtons.forEach(btn => btn.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
  }

  showToast(message) {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span> <span>${escapeHTML(message)}</span>`;
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

// Inicialização Global
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new AuraApp();
});
