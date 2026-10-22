import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../data/repositories/finance_repository.dart';

class GoalsTab extends StatelessWidget {
  final FinanceRepository repo;
  const GoalsTab({super.key, required this.repo});

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Score de Saúde Financeira
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F1E33), Color(0xFF0C1322)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppTheme.accentEmerald.withOpacity(0.3)),
              boxShadow: [
                BoxShadow(color: AppTheme.accentEmerald.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 8)),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.accentEmerald, width: 4),
                  ),
                  alignment: Alignment.center,
                  child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('84', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppTheme.textWhite)),
                      Text('EXCELENTE', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: AppTheme.accentEmerald)),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Saúde Financeira Forte 🌟', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                      SizedBox(height: 4),
                      Text('Top 12% dos usuários em taxa de poupança e controle orçamentário.', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      SizedBox(height: 8),
                      Text('🔥 14 dias de streak!', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentAmber)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Metas ("Caixinhas")
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Minhas Metas ("Caixinhas")', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
              Text('${repo.goals.length} ativas', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
            ],
          ),
          const SizedBox(height: 12),

          ...repo.goals.map((goal) {
            final pct = (goal.progressPercentage * 100).toStringAsFixed(0);
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.bgCard,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.borderGlass),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Text(goal.icon, style: const TextStyle(fontSize: 18)),
                          const SizedBox(width: 8),
                          Text(goal.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: Colors.white.withOpacity(0.06), borderRadius: BorderRadius.circular(10)),
                        child: Text('$pct%', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.accentEmerald)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(currency.format(goal.currentAmount), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.accentEmerald)),
                      Text('Alvo: ${currency.format(goal.targetAmount)}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: goal.progressPercentage,
                      minHeight: 8,
                      backgroundColor: Colors.white.withOpacity(0.08),
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accentEmerald),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 36,
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        side: Border.all(color: AppTheme.accentEmerald.withOpacity(0.4)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () => _showDepositDialog(context, goal.id, goal.title),
                      child: const Text('+ Guardar Dinheiro nesta Meta', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentEmerald)),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  void _showDepositDialog(BuildContext context, String goalId, String goalTitle) {
    final controller = TextEditingController(text: '100');
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: AppTheme.bgCard,
          title: Text('Aporte: $goalTitle', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          content: TextField(
            controller: controller,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(labelText: 'Valor a guardar (R\$)'),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentEmerald),
              onPressed: () {
                final val = double.tryParse(controller.text) ?? 0;
                if (val > 0) {
                  repo.depositToGoal(goalId, val);
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Aporte de R\$ ${val.toStringAsFixed(2)} guardado na caixinha! 🚀')),
                  );
                }
              },
              child: const Text('Confirmar Aporte', style: TextStyle(color: Colors.black)),
            ),
          ],
        );
      },
    );
  }
}
