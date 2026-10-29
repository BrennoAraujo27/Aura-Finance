import 'package:flutter/foundation.dart';
import '../../domain/models/financial_models.dart';

class FinanceRepository extends ChangeNotifier {
  // Usuário
  UserModel user = UserModel(
    name: 'Brenno Araujo',
    avatar: 'BA',
    monthlyGrossIncome: 12000.0,
    monthlyNetIncome: 9500.0,
    workHoursPerMonth: 160,
    hourlyWage: 59.38,
  );

  // Contas
  List<AccountModel> accounts = [
    AccountModel(id: 'nu', name: 'Nubank', type: 'CHECKING', balance: 3420.00),
    AccountModel(id: 'itau', name: 'Itaú Card', type: 'CREDIT_CARD', balance: -2450.00),
    AccountModel(id: 'inter', name: 'Inter Invest', type: 'INVESTMENT', balance: 18500.00),
  ];

  // Transações
  List<TransactionModel> transactions = [
    TransactionModel(
      id: 'tx_1',
      description: 'Supermercado Pão de Açúcar',
      cleanMerchant: 'Pão de Açúcar',
      amount: -412.50,
      direction: TransactionDirection.outflow,
      category: 'needs_supermarket',
      categoryLabel: 'Mercado',
      budgetRule: BudgetRuleType.needs50,
      account: 'Nubank',
      date: DateTime.now().subtract(const Duration(hours: 4)),
      icon: '🛒',
    ),
    TransactionModel(
      id: 'tx_2',
      description: 'iFood *Restaurante Mania',
      cleanMerchant: 'iFood',
      amount: -68.90,
      direction: TransactionDirection.outflow,
      category: 'wants_delivery',
      categoryLabel: 'Delivery',
      budgetRule: BudgetRuleType.wants30,
      account: 'Itaú Card',
      date: DateTime.now().subtract(const Duration(days: 1)),
      icon: '🍔',
    ),
    TransactionModel(
      id: 'tx_3',
      description: 'Salário Tech Corp',
      cleanMerchant: 'Tech Corp',
      amount: 9500.00,
      direction: TransactionDirection.inflow,
      category: 'salary',
      categoryLabel: 'Salário Líquido',
      budgetRule: BudgetRuleType.inflow,
      account: 'Nubank',
      date: DateTime.now().subtract(const Duration(days: 17)),
      icon: '💼',
    ),
    TransactionModel(
      id: 'tx_4',
      description: 'QuintoAndar Aluguel + Cond',
      cleanMerchant: 'QuintoAndar',
      amount: -2650.00,
      direction: TransactionDirection.outflow,
      category: 'needs_housing',
      categoryLabel: 'Moradia',
      budgetRule: BudgetRuleType.needs50,
      account: 'Nubank',
      date: DateTime.now().subtract(const Duration(days: 12)),
      icon: '🏠',
    ),
    TransactionModel(
      id: 'tx_5',
      description: 'Aporte Tesouro Selic',
      cleanMerchant: 'Tesouro Direto',
      amount: -1500.00,
      direction: TransactionDirection.outflow,
      category: 'savings_reserve',
      categoryLabel: 'Reserva & Aportes',
      budgetRule: BudgetRuleType.savings20,
      account: 'Inter Invest',
      date: DateTime.now().subtract(const Duration(days: 16)),
      icon: '📈',
    ),
  ];

  // Metas ("Caixinhas")
  List<FinancialGoalModel> goals = [
    FinancialGoalModel(
      id: 'goal_1',
      title: 'Reserva de Emergência',
      currentAmount: 18500.00,
      targetAmount: 30000.00,
      deadline: 'Dezembro 2026',
      icon: '🛡️',
    ),
    FinancialGoalModel(
      id: 'goal_2',
      title: 'Viagem Europa 2027',
      currentAmount: 4200.00,
      targetAmount: 15000.00,
      deadline: 'Julho 2027',
      icon: '✈️',
    ),
    FinancialGoalModel(
      id: 'goal_3',
      title: 'Novo MacBook Pro M-Chip',
      currentAmount: 6800.00,
      targetAmount: 12000.00,
      deadline: 'Março 2027',
      icon: '💻',
    ),
  ];

  // Ralos Financeiros
  List<LeakModel> leaks = [
    LeakModel(
      id: 'leak_1',
      title: 'Smart Fit Academia (Não utilizada)',
      frequency: 'Mensal',
      costMonthly: 149.90,
      costAnnual: 1798.80,
      note: 'Sem check-in nos últimos 42 dias',
    ),
    LeakModel(
      id: 'leak_2',
      title: 'Café Expresso de Rua (Microgasto)',
      frequency: 'Diário útil (22x/mês)',
      costMonthly: 264.00,
      costAnnual: 3168.00,
      note: 'Média de R\$ 12,00 por dia útil',
    ),
    LeakModel(
      id: 'leak_3',
      title: 'Streaming de Vídeo Secundário',
      frequency: 'Mensal',
      costMonthly: 55.90,
      costAnnual: 670.80,
      note: 'Apenas 1 hora de reprodução no mês',
    ),
  ];

  // Métricas do Futurômetro
  int daysRemainingInMonth = 9;
  double get totalLiquidBalance => accounts.fold(0.0, (acc, curr) => acc + curr.balance);

  double get safeDailySpend {
    final checking = accounts.firstWhere((a) => a.type == 'CHECKING', orElse: () => accounts.first).balance;
    final remaining = checking - 1500;
    return remaining > 0 ? (remaining / daysRemainingInMonth) : 25.0;
  }

  double get projectedClosingBalance {
    final checking = accounts.firstWhere((a) => a.type == 'CHECKING', orElse: () => accounts.first).balance;
    return checking - (safeDailySpend * daysRemainingInMonth * 0.7);
  }

  // 50/30/20
  double get spentNeeds => transactions
      .where((t) => t.direction == TransactionDirection.outflow && t.budgetRule == BudgetRuleType.needs50)
      .fold(0.0, (acc, t) => acc + t.amount.abs());

  double get spentWants => transactions
      .where((t) => t.direction == TransactionDirection.outflow && t.budgetRule == BudgetRuleType.wants30)
      .fold(0.0, (acc, t) => acc + t.amount.abs());

  double get spentSavings => transactions
      .where((t) => t.direction == TransactionDirection.outflow && t.budgetRule == BudgetRuleType.savings20)
      .fold(0.0, (acc, t) => acc + t.amount.abs());

  // Ações
  void addTransaction(TransactionModel tx) {
    transactions.insert(0, tx);
    final acc = accounts.firstWhere((a) => a.name == tx.account, orElse: () => accounts.first);
    acc.balance += tx.amount;
    notifyListeners();
  }

  void depositToGoal(String goalId, double amount) {
    final goal = goals.firstWhere((g) => g.id == goalId);
    goal.currentAmount += amount;
    addTransaction(
      TransactionModel(
        id: 'tx_dep_${DateTime.now().millisecondsSinceEpoch}',
        description: 'Aporte Meta: ${goal.title}',
        cleanMerchant: goal.title,
        amount: -amount,
        direction: TransactionDirection.outflow,
        category: 'savings_reserve',
        categoryLabel: 'Aporte Meta',
        budgetRule: BudgetRuleType.savings20,
        account: 'Inter Invest',
        date: DateTime.now(),
        icon: '🎯',
      ),
    );
    notifyListeners();
  }

  void plugLeak(String leakId) {
    leaks.removeWhere((l) => l.id == leakId);
    notifyListeners();
  }

  void updateProfile({
    required String name,
    required double netIncome,
    required double grossIncome,
    required int workHours,
    required double checkingBalance,
    required double cardInvoice,
    required double investmentBalance,
    bool clearDemoTransactions = false,
  }) {
    user.name = name;
    user.monthlyNetIncome = netIncome;
    user.monthlyGrossIncome = grossIncome;
    user.workHoursPerMonth = workHours;
    user.hourlyWage = (netIncome / workHours);

    final parts = name.split(' ').where((p) => p.isNotEmpty).toList();
    user.avatar = parts.length > 1 ? '${parts.first[0]}${parts.last[0]}'.toUpperCase() : name.substring(0, 2).toUpperCase();

    final checking = accounts.firstWhere((a) => a.type == 'CHECKING');
    checking.balance = checkingBalance;

    final card = accounts.firstWhere((a) => a.type == 'CREDIT_CARD');
    card.balance = -cardInvoice.abs();

    final invest = accounts.firstWhere((a) => a.type == 'INVESTMENT');
    invest.balance = investmentBalance;

    if (clearDemoTransactions) {
      transactions.clear();
    }

    notifyListeners();
  }

  // Simulador "Posso Comprar?"
  PurchaseSimulationResult simulatePurchase({
    required String itemName,
    required double amount,
  }) {
    final workHoursTotal = amount / user.hourlyWage;
    final hours = workHoursTotal.floor();
    final minutes = ((workHoursTotal - hours) * 60).round();

    final totalSafeRemaining = safeDailySpend * daysRemainingInMonth;
    final shareOfBudget = ((amount / totalSafeRemaining) * 100).clamp(0.0, 100.0);
    final dailyImpact = amount / daysRemainingInMonth;
    final newSafe = (safeDailySpend - dailyImpact).clamp(0.0, double.infinity);

    PurchaseVerdict verdict;
    String verdictLabel;
    String rationale;

    if (shareOfBudget > 70 || amount > totalSafeRemaining) {
      verdict = PurchaseVerdict.risk;
      verdictLabel = '🔴 Risco Financeiro';
      rationale = 'Comprar "$itemName" custará $hours h e $minutes min de trabalho e consumirá ${shareOfBudget.toStringAsFixed(1)}% da sua folga de caixa restante. Seu gasto diário seguro despencará para R\$ ${newSafe.toStringAsFixed(2)}/dia. Recomendo adiar para o próximo mês ou aplicar a Regra dos 3 Dias.';
    } else if (shareOfBudget >= 30) {
      verdict = PurchaseVerdict.caution;
      verdictLabel = '🟡 Requer Cautela';
      rationale = '"$itemName" custa $hours h e $minutes min de esforço. Consome ${shareOfBudget.toStringAsFixed(1)}% da sua margem. Se puder parcelar ou esperar a virada do ciclo em $daysRemainingInMonth dias, o impacto no orçamento fica suave.';
    } else {
      verdict = PurchaseVerdict.approved;
      verdictLabel = '🟢 Compra Tranquila';
      rationale = 'Perfeito! Esse gasto consome apenas ${shareOfBudget.toStringAsFixed(1)}% da sua margem livre ($hours h de trabalho) e não compromete suas caixinhas nem a regra 50/30/20. Pode comprar!';
    }

    return PurchaseSimulationResult(
      verdict: verdict,
      verdictLabel: verdictLabel,
      workHours: hours,
      workMinutes: minutes,
      shareOfBudget: shareOfBudget,
      dailyImpact: dailyImpact,
      newSafeDaily: newSafe,
      rationale: rationale,
    );
  }
}
