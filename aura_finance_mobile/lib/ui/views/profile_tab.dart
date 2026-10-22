import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../data/repositories/finance_repository.dart';

class ProfileTab extends StatelessWidget {
  final FinanceRepository repo;
  const ProfileTab({super.key, required this.repo});

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Card de Perfil
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppTheme.bgCard,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppTheme.borderGlass),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF1E3A8A)]),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        repo.user.avatar,
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(repo.user.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                          const SizedBox(height: 2),
                          const Text('✓ Identidade Biométrica Confirmada', style: TextStyle(fontSize: 11, color: AppTheme.accentEmerald)),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit, color: AppTheme.accentCyan),
                      onPressed: () => _showEditProfileDialog(context),
                      tooltip: 'Editar Meus Dados',
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // Renda & Valor da Hora
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppTheme.borderGlass),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Renda Líquida Mensal', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                          const SizedBox(height: 2),
                          Text(currency.format(repo.user.monthlyNetIncome), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('Valor da Hora Líquida', style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                          const SizedBox(height: 2),
                          Text('${currency.format(repo.user.hourlyWage)}/h', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.accentEmerald)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Menu de Configurações
          _buildMenuItem(Icons.account_balance, 'Conexões Open Finance', 'Nubank, Itaú Card, Inter Invest ativos'),
          _buildMenuItem(Icons.lock_outline, 'Privacidade & LGPD', 'Criptografia AES-256 e consentimento revogável'),
          _buildMenuItem(Icons.fingerprint, 'Segurança & Biometria', 'FaceID e autenticação de dois fatores'),
        ],
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderGlass),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.accentCyan, size: 22),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textWhite)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 20),
        ],
      ),
    );
  }

  void _showEditProfileDialog(BuildContext context) {
    final nameCtrl = TextEditingController(text: repo.user.name);
    final netCtrl = TextEditingController(text: repo.user.monthlyNetIncome.toStringAsFixed(2));
    final hoursCtrl = TextEditingController(text: repo.user.workHoursPerMonth.toString());

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: AppTheme.bgCard,
          title: const Text('Editar Meus Dados', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Seu Nome Completo'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: netCtrl,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(labelText: 'Renda Líquida Mensal (R\$)'),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: hoursCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Horas Trabalhadas no Mês (ex: 160)'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentEmerald),
              onPressed: () {
                final name = nameCtrl.text.trim();
                final net = double.tryParse(netCtrl.text.replaceAll(',', '.')) ?? 0;
                final hours = int.tryParse(hoursCtrl.text) ?? 160;

                if (name.isNotEmpty && net > 0) {
                  repo.updateProfile(
                    name: name,
                    netIncome: net,
                    grossIncome: net * 1.3,
                    workHours: hours,
                    checkingBalance: repo.accounts.firstWhere((a) => a.type == 'CHECKING').balance,
                    cardInvoice: repo.accounts.firstWhere((a) => a.type == 'CREDIT_CARD').balance.abs(),
                    investmentBalance: repo.accounts.firstWhere((a) => a.type == 'INVESTMENT').balance,
                  );
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Perfil atualizado com sucesso, $name! 🚀')),
                  );
                }
              },
              child: const Text('Salvar Dados', style: TextStyle(color: Colors.black)),
            ),
          ],
        );
      },
    );
  }
}
