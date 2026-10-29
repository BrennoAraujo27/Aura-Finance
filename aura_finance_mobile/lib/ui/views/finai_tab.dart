import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../data/repositories/finance_repository.dart';
import '../../domain/models/financial_models.dart';

class FinAiTab extends StatefulWidget {
  final FinanceRepository repo;
  const FinAiTab({super.key, required this.repo});

  @override
  State<FinAiTab> createState() => _FinAiTabState();
}

class _FinAiTabState extends State<FinAiTab> {
  final TextEditingController _itemController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  PurchaseSimulationResult? _result;

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header FinAI
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(colors: [AppTheme.accentPurple, AppTheme.accentCyan]),
                ),
                alignment: Alignment.center,
                child: const Text('✨', style: TextStyle(fontSize: 20)),
              ),
              const SizedBox(width: 12),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('FinAI Copilot', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                  Text('Consultor comportamental inteligente', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Card do Simulador "Posso Comprar?"
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppTheme.bgCard,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppTheme.accentPurple.withOpacity(0.3)),
              boxShadow: [
                BoxShadow(color: AppTheme.accentPurple.withOpacity(0.12), blurRadius: 20, offset: const Offset(0, 8)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('SIMULADOR INTELIGENTE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.accentPurple, letterSpacing: 0.6)),
                const SizedBox(height: 4),
                const Text('Posso Comprar Isso Agora?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                const SizedBox(height: 4),
                const Text('Avalie o impacto nas suas metas e veja quantas horas de esforço de trabalho esse gasto representa.', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                const SizedBox(height: 16),

                // Inputs
                TextField(
                  controller: _itemController,
                  decoration: InputDecoration(
                    labelText: 'O que você quer comprar?',
                    hintText: 'Ex: Tênis de corrida, Fone Bluetooth...',
                    filled: true,
                    fillColor: Colors.black26,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.borderGlass)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _amountController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: InputDecoration(
                    labelText: 'Preço (R\$)',
                    hintText: 'Ex: 899,00',
                    filled: true,
                    fillColor: Colors.black26,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppTheme.borderGlass)),
                  ),
                ),
                const SizedBox(height: 16),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accentPurple,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 4,
                    ),
                    onPressed: () {
                      final name = _itemController.text.trim();
                      final val = double.tryParse(_amountController.text.replaceAll(',', '.')) ?? 0;
                      if (name.isNotEmpty && val > 0) {
                        setState(() {
                          _result = widget.repo.simulatePurchase(itemName: name, amount: val);
                        });
                      }
                    },
                    child: const Text('Analisar Impacto na Minha Renda 🧠', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  ),
                ),

                // Card de Resultado
                if (_result != null) ...[
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.black38,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _result!.verdict == PurchaseVerdict.approved
                            ? AppTheme.accentEmerald
                            : (_result!.verdict == PurchaseVerdict.caution ? AppTheme.accentAmber : AppTheme.accentCoral),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _result!.verdictLabel,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: _result!.verdict == PurchaseVerdict.approved
                                    ? AppTheme.accentEmerald
                                    : (_result!.verdict == PurchaseVerdict.caution ? AppTheme.accentAmber : AppTheme.accentCoral),
                              ),
                            ),
                            const Text('Calculado agora', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: Colors.white.withOpacity(0.04), borderRadius: BorderRadius.circular(8)),
                                child: Column(
                                  children: [
                                    const Text('Trabalho', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                                    const SizedBox(height: 2),
                                    Text('${_result!.workHours}h ${_result!.workMinutes}m', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: Colors.white.withOpacity(0.04), borderRadius: BorderRadius.circular(8)),
                                child: Column(
                                  children: [
                                    const Text('Folga Mês', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                                    const SizedBox(height: 2),
                                    Text('${_result!.shareOfBudget.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: Colors.white.withOpacity(0.04), borderRadius: BorderRadius.circular(8)),
                                child: Column(
                                  children: [
                                    const Text('Novo Diário', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                                    const SizedBox(height: 2),
                                    Text(currency.format(_result!.newSafeDaily), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.accentCyan)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _result!.rationale,
                          style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
