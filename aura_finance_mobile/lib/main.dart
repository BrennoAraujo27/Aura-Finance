import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'data/repositories/finance_repository.dart';
import 'ui/views/home_view.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: AuraFinanceApp(),
    ),
  );
}

class AuraFinanceApp extends StatefulWidget {
  const AuraFinanceApp({super.key});

  @override
  State<AuraFinanceApp> createState() => _AuraFinanceAppState();
}

class _AuraFinanceAppState extends State<AuraFinanceApp> {
  final FinanceRepository _repo = FinanceRepository();

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aura Finance',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: HomeView(repo: _repo),
    );
  }
}
