enum BudgetRuleType { needs50, wants30, savings20, inflow }

enum TransactionDirection { inflow, outflow }

class TransactionModel {
  final String id;
  final String description;
  final String cleanMerchant;
  final double amount;
  final TransactionDirection direction;
  final String category;
  final String categoryLabel;
  final BudgetRuleType budgetRule;
  final String account;
  final DateTime date;
  final String icon;

  TransactionModel({
    required this.id,
    required this.description,
    required this.cleanMerchant,
    required this.amount,
    required this.direction,
    required this.category,
    required this.categoryLabel,
    required this.budgetRule,
    required this.account,
    required this.date,
    required this.icon,
  });
}

class AccountModel {
  final String id;
  final String name;
  final String type; // 'CHECKING' | 'CREDIT_CARD' | 'INVESTMENT'
  double balance;

  AccountModel({
    required this.id,
    required this.name,
    required this.type,
    required this.balance,
  });
}

class FinancialGoalModel {
  final String id;
  final String title;
  double currentAmount;
  final double targetAmount;
  final String deadline;
  final String icon;

  FinancialGoalModel({
    required this.id,
    required this.title,
    required this.currentAmount,
    required this.targetAmount,
    required this.deadline,
    required this.icon,
  });

  double get progressPercentage => (currentAmount / targetAmount).clamp(0.0, 1.0);
}

class LeakModel {
  final String id;
  final String title;
  final String frequency;
  final double costMonthly;
  final double costAnnual;
  final String note;

  LeakModel({
    required this.id,
    required this.title,
    required this.frequency,
    required this.costMonthly,
    required this.costAnnual,
    required this.note,
  });
}

class UserModel {
  String name;
  String avatar;
  double monthlyNetIncome;
  double monthlyGrossIncome;
  int workHoursPerMonth;
  double hourlyWage;

  UserModel({
    required this.name,
    required this.avatar,
    required this.monthlyNetIncome,
    required this.monthlyGrossIncome,
    required this.workHoursPerMonth,
    required this.hourlyWage,
  });
}

enum PurchaseVerdict { approved, caution, risk }

class PurchaseSimulationResult {
  final PurchaseVerdict verdict;
  final String verdictLabel;
  final int workHours;
  final int workMinutes;
  final double shareOfBudget;
  final double dailyImpact;
  final double newSafeDaily;
  final String rationale;

  PurchaseSimulationResult({
    required this.verdict,
    required this.verdictLabel,
    required this.workHours,
    required this.workMinutes,
    required this.shareOfBudget,
    required this.dailyImpact,
    required this.newSafeDaily,
    required this.rationale,
  });
}
