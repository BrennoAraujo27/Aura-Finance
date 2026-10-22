import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../data/repositories/finance_repository.dart';
import '../../domain/models/financial_models.dart';

class DashboardTab extends StatelessWidget {
  final FinanceRepository repo;
  const DashboardTab({super.key, required this.repo});

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

    final totalBalance = repo.totalLiquidBalance;
    final totalInflow = repo.transactions
        .where((t) => t.direction == TransactionDirection.inflow)
        .fold(0.0, (acc, t) => acc + t.amount);
    final totalOutflow = repo.transactions
        .where((t) => t.direction == TransactionDirection.outflow)
        .fold(0.0, (acc, t) => acc + t.amount.abs());

    final netIncome = repo.user.monthlyNetIncome;
    final pctNeeds = ((repo.spentNeeds / netIncome) * 100).clamp(0.0, 100.0);
    final pctWants = ((repo.spentWants / netIncome) * 100).clamp(0.0, 100.0);
    final pctSavings = ((repo.spentSavings / netIncome) * 100).clamp(0.0, 100.0);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Card de Patrimônio Líquido
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF182238), Color(0xFF0E1322)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppTheme.borderGlass),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black45,
                  blurRadius: 20,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'PATRIMÔNIO LÍQUIDO DISPONÍVEL',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  currency.format(totalBalance),
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textWhite,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.04),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.borderGlass),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Entradas (Mês)', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                            const SizedBox(height: 2),
                            Text(
                              '+ ${currency.format(totalInflow)}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.accentEmerald),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.04),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.borderGlass),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Saídas (Mês)', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                            const SizedBox(height: 2),
                            Text(
                              '- ${currency.format(totalOutflow)}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.accentCoral),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Banner de Acesso Rápido ao Futurômetro
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F1E38), Color(0xFF1A1230)],
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.accentCyan.withOpacity(0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Text('🔮 ', style: TextStyle(fontSize: 14)),
                        Text(
                          'FUTURÔMETRO',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.accentCyan,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text('Saldo Previsto:', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                    Text(
                      currency.format(repo.projectedClosingBalance),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppTheme.accentEmerald),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.borderGlass),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text('Gasto Diário Seguro', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                      Text(
                        '${currency.format(repo.safeDailySpend)}/dia',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.accentCyan),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Régua 50/30/20
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppTheme.bgCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.borderGlass),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Orçamento 50 / 30 / 20', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                    Text('MÊS ATUAL', style: TextStyle(fontSize: 10, color: AppTheme.accentEmerald, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 14),
                _buildRuleBar('50% Necessidades', pctNeeds, const Color(0xFF3B82F6)),
                const SizedBox(height: 12),
                _buildRuleBar('30% Desejos', pctWants, AppTheme.accentPurple),
                const SizedBox(height: 12),
                _buildRuleBar('20% Metas & Investimentos', pctSavings, AppTheme.accentEmerald),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Últimas Transações
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppTheme.bgCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.borderGlass),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Últimas Transações', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                const SizedBox(height: 12),
                ...repo.transactions.take(5).map((tx) {
                  final isOutflow = tx.direction == TransactionDirection.outflow;
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.05),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              alignment: Alignment.center,
                              child: Text(tx.icon, style: const TextStyle(fontSize: 16)),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(tx.cleanMerchant, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textWhite)),
                                Text(tx.categoryLabel, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                              ],
                            ),
                          ],
                        ),
                        Text(
                          '${isOutflow ? '-' : '+'} ${currency.format(tx.amount.abs())}',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: isOutflow ? AppTheme.textWhite : AppTheme.accentEmerald,
                          ),
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRuleBar(String title, double percentage, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
            Text('${percentage.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: percentage / 100,
            minHeight: 8,
            backgroundColor: Colors.white.withOpacity(0.08),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }
}
