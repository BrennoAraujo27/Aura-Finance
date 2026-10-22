import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/repositories/finance_repository.dart';
import '../../domain/models/financial_models.dart';
import 'dashboard_tab.dart';
import 'futuro_tab.dart';
import 'finai_tab.dart';
import 'goals_tab.dart';
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
      GoalsTab(repo: widget.repo),
      ProfileTab(repo: widget.repo),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 14,
              height: 14,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(colors: [AppTheme.accentEmerald, AppTheme.accentCyan]),
              ),
            ),
            const SizedBox(width: 8),
            RichText(
              text: const TextSpan(
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                children: [
                  TextSpan(text: 'Aura'),
                  TextSpan(text: 'Finance', style: TextStyle(color: AppTheme.accentEmerald)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync, color: AppTheme.accentCyan),
            tooltip: 'Sincronizar Open Finance',
            onPressed: () {
              widget.repo.addTransaction(
                TransactionModel(
                  id: 'tx_sync_${DateTime.now().millisecondsSinceEpoch}',
                  description: 'Padaria Bella Paulista',
                  cleanMerchant: 'Bella Paulista',
                  amount: -28.50,
                  direction: TransactionDirection.outflow,
                  category: 'needs_supermarket',
                  categoryLabel: 'Alimentação',
                  budgetRule: BudgetRuleType.needs50,
                  account: 'Nubank',
                  date: DateTime.now(),
                  icon: '🥐',
                ),
              );
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Open Finance: 1 nova transação conciliada!')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.add_circle, color: AppTheme.accentEmerald),
            tooltip: 'Nova Transação',
            onPressed: () => _showAddTransactionDialog(context),
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: widget.repo,
        builder: (context, _) => tabs[_currentIndex],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Início'),
          BottomNavigationBarItem(icon: Icon(Icons.timeline), label: 'Futurômetro'),
          BottomNavigationBarItem(icon: Icon(Icons.auto_awesome), label: 'FinAI'),
          BottomNavigationBarItem(icon: Icon(Icons.stars), label: 'Metas'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Perfil'),
        ],
      ),
    );
  }

  void _showAddTransactionDialog(BuildContext context) {
    final descCtrl = TextEditingController();
    final valCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: AppTheme.bgCard,
          title: const Text('Nova Transação', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Descrição')),
              const SizedBox(height: 10),
              TextField(
                controller: valCtrl,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'Valor (R\$)'),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentEmerald),
              onPressed: () {
                final desc = descCtrl.text.trim();
                final val = double.tryParse(valCtrl.text.replaceAll(',', '.')) ?? 0;
                if (desc.isNotEmpty && val > 0) {
                  widget.repo.addTransaction(
                    TransactionModel(
                      id: 'tx_user_${DateTime.now().millisecondsSinceEpoch}',
                      description: desc,
                      cleanMerchant: desc,
                      amount: -val,
                      direction: TransactionDirection.outflow,
                      category: 'wants_delivery',
                      categoryLabel: 'Despesa',
                      budgetRule: BudgetRuleType.wants30,
                      account: 'Nubank',
                      date: DateTime.now(),
                      icon: '💳',
                    ),
                  );
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Transação adicionada com sucesso!')),
                  );
                }
              },
              child: const Text('Salvar', style: TextStyle(color: Colors.black)),
            ),
          ],
        );
      },
    );
  }
}
