import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/repositories/finance_repository.dart';
import '../../domain/models/financial_models.dart';
import 'dashboard_tab.dart';
import 'futuro_tab.dart';
import 'finai_tab.dart';
import 'profile_tab.dart';

class HomeView extends StatefulWidget {
  final FinanceRepository repo;
  const HomeView({super.key, required this.repo});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final tabs = [
      DashboardTab(repo: widget.repo),
      FuturoTab(repo: widget.repo),
      FinAiTab(repo: widget.repo),
      ProfileTab(repo: widget.repo),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.textDark, width: 2.2),
              ),
              child: Center(
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.textDark,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            const Text(
              'AURA WEALTH',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.2,
                color: AppTheme.textDark,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle, color: AppTheme.heroNavy, size: 28),
            tooltip: 'Nova Compra',
            onPressed: () => _showAddTransactionDialog(context),
          ),
        ],
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        child: tabs[_currentIndex],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (idx) => setState(() => _currentIndex = idx),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Início',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.trending_up),
            activeIcon: Icon(Icons.trending_up),
            label: 'Futurômetro',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.auto_awesome_outlined),
            activeIcon: Icon(Icons.auto_awesome),
            label: 'FinAI',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }

  void _showAddTransactionDialog(BuildContext context) {
    final descCtrl = TextEditingController(text: 'Remédio');
    final valCtrl = TextEditingController(text: '109,00');
    String selectedCard = 'Nubank';
    int installments = 1;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            final val = double.tryParse(valCtrl.text.replaceAll(',', '.')) ?? 0;
            final instValue = installments > 1 && val > 0 ? (val / installments) : 0.0;

            return AlertDialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: const Row(
                children: [
                  Text('🛍️ ', style: TextStyle(fontSize: 20)),
                  Text('Registrar Compra', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textDark, fontSize: 18)),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: descCtrl,
                      decoration: InputDecoration(
                        labelText: 'Descrição da Compra',
                        hintText: 'Ex: Remédio, Supermercado',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: valCtrl,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        labelText: 'Valor Total (R\$)',
                        hintText: '109,00',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onChanged: (_) => setDialogState(() {}),
                    ),
                    const SizedBox(height: 14),
                    const Text('Cartão de Pagamento:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      value: selectedCard,
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'Nubank', child: Text('Nubank Ultravioleta')),
                        DropdownMenuItem(value: 'Inter', child: Text('Inter Mastercard Black')),
                        DropdownMenuItem(value: 'Itaú', child: Text('Itaú Personnalité Visa')),
                      ],
                      onChanged: (val) {
                        if (val != null) setDialogState(() => selectedCard = val);
                      },
                    ),
                    const SizedBox(height: 14),
                    const Text('Condição de Pagamento:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMuted)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<int>(
                      value: installments,
                      decoration: InputDecoration(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      items: [
                        const DropdownMenuItem(value: 1, child: Text('À vista (1x)')),
                        for (int i = 2; i <= 12; i++)
                          DropdownMenuItem(value: i, child: Text('Parcelado em ${i}x')),
                      ],
                      onChanged: (val) {
                        if (val != null) setDialogState(() => installments = val);
                      },
                    ),
                    if (installments > 1 && instValue > 0) ...[
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0D1527).withOpacity(0.05),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF0D1527).withOpacity(0.1)),
                        ),
                        child: Row(
                          children: [
                            const Text('💳 ', style: TextStyle(fontSize: 16)),
                            Expanded(
                              child: Text(
                                '${installments}x de R\$ ${instValue.toStringAsFixed(2)} nas próximas faturas',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF0D1527)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancelar', style: TextStyle(color: AppTheme.textMuted)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.heroNavy,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    final desc = descCtrl.text.trim();
                    final val = double.tryParse(valCtrl.text.replaceAll(',', '.')) ?? 0;
                    if (desc.isNotEmpty && val > 0) {
                      final itemDescription = installments > 1 
                          ? '$desc (${installments}x de R\$ ${instValue.toStringAsFixed(2)})'
                          : desc;

                      widget.repo.addTransaction(
                        TransactionModel(
                          id: 'tx_user_${DateTime.now().millisecondsSinceEpoch}',
                          description: itemDescription,
                          cleanMerchant: desc,
                          amount: -val,
                          direction: TransactionDirection.outflow,
                          category: 'wants_delivery',
                          categoryLabel: 'Compra Manual',
                          budgetRule: BudgetRuleType.wants30,
                          account: selectedCard,
                          date: DateTime.now(),
                          icon: '🛍️',
                        ),
                      );
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: const Color(0xFF0D1527),
                          content: Text('Compra "$desc" de R\$ ${val.toStringAsFixed(2)} registrada no cartão $selectedCard!'),
                        ),
                      );
                    }
                  },
                  child: const Text('Confirmar Compra', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
