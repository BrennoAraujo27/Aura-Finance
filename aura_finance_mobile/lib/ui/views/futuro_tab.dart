import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../data/repositories/finance_repository.dart';

class FuturoTab extends StatefulWidget {
  final FinanceRepository repo;
  const FuturoTab({super.key, required this.repo});

  @override
  State<FuturoTab> createState() => _FuturoTabState();
}

class _FuturoTabState extends State<FuturoTab> {
  late double _simulatedDaily;

  @override
  void initState() {
    super.initState();
    _simulatedDaily = widget.repo.safeDailySpend;
  }

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
    final repo = widget.repo;
    final totalLeaks = repo.leaks.fold(0.0, (acc, l) => acc + l.costAnnual);

    final diff = (_simulatedDaily - repo.safeDailySpend) * repo.daysRemainingInMonth;
    final simulatedClosing = repo.projectedClosingBalance - diff;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Card do Futurômetro
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF101A2F), Color(0xFF16102A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppTheme.accentCyan.withOpacity(0.3)),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.accentCyan.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.accentCyan.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    '🔮 Projeção Preditiva IA',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentCyan),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Saldo Previsto de Fechamento',
                  style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 4),
                Text(
                  currency.format(repo.projectedClosingBalance),
                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppTheme.accentEmerald),
                ),
                const SizedBox(height: 16),

                // Gasto Diário Seguro
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderGlass),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Gasto Diário Seguro', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                          Text(
                            '${currency.format(repo.safeDailySpend)} / dia',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.accentCyan),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Se você gastar até esse valor nos próximos ${repo.daysRemainingInMonth} dias, fechará o mês no azul.',
                        style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                      ),
                      const SizedBox(height: 14),

                      // Slider Interativo de Simulação
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Simular Gasto Diário:', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                          Text(
                            currency.format(_simulatedDaily),
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textWhite),
                          ),
                        ],
                      ),
                      Slider(
                        value: _simulatedDaily.clamp(20.0, 250.0),
                        min: 20.0,
                        max: 250.0,
                        activeColor: AppTheme.accentCyan,
                        inactiveColor: Colors.white12,
                        onChanged: (val) {
                          setState(() {
                            _simulatedDaily = val;
                          });
                        },
                      ),
                      Text(
                        diff > 0
                            ? 'Impacto: saldo final cairá para ${currency.format(simulatedClosing)} (-${currency.format(diff)})'
                            : 'Impacto: saldo final subirá para ${currency.format(simulatedClosing)} (+${currency.format(diff.abs())})',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: diff > 0 ? AppTheme.accentCoral : AppTheme.accentEmerald,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Detector de Ralos Financeiros
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '🚨 Detector de Ralos Financeiros',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textWhite),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.accentCoral.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${currency.format(totalLeaks)}/ano',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentCoral),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          ...repo.leaks.map((leak) {
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.accentCoral.withOpacity(0.04),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.accentCoral.withOpacity(0.2)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(leak.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                        const SizedBox(height: 2),
                        Text('Custa ${currency.format(leak.costMonthly)}/mês (${leak.note})', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accentCoral.withOpacity(0.18),
                      foregroundColor: AppTheme.accentCoral,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () {
                      widget.repo.plugLeak(leak.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Ralo financeiro plugado com sucesso!')),
                      );
                    },
                    child: const Text('Plugue!', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
