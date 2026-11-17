import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Cores Aura Wealth (Light theme com Midnight Navy)
  static const Color bgDeep = Color(0xFFFAFAFA);
  static const Color bgSurface = Color(0xFFFFFFFF);
  static const Color bgCard = Color(0xFFFFFFFF);
  static const Color heroNavy = Color(0xFF0D1527);
  static const Color subcardNavy = Color(0xFF16213B);
  static const Color innerNavy = Color(0xFF131D33);
  static const Color borderLight = Color(0xFFEEF2F6);
  static const Color dividerLight = Color(0xFFF1F5F9);

  // Acentos Financeiros
  static const Color accentEmerald = Color(0xFF00F090);
  static const Color accentCoral = Color(0xFFFF3B5C);
  static const Color accentAmber = Color(0xFFFFB703);
  static const Color accentCyan = Color(0xFF00D2FF);

  // Tipografia & Textos
  static const Color textDark = Color(0xFF0D1527);
  static const Color textSlate = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF64748B);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textHeroSub = Color(0xFF8E9BB0);
  static const Color textWhite = Color(0xFFFFFFFF);

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: bgDeep,
      primaryColor: heroNavy,
      cardColor: bgCard,
      colorScheme: const ColorScheme.light(
        primary: heroNavy,
        secondary: accentEmerald,
        surface: bgSurface,
        error: accentCoral,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(
        ThemeData.light().textTheme,
      ).apply(
        bodyColor: textSlate,
        displayColor: textDark,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgSurface,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: textDark),
        titleTextStyle: TextStyle(
          color: textDark,
          fontSize: 16,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.2,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bgSurface,
        selectedItemColor: heroNavy,
        unselectedItemColor: textSecondary,
        selectedLabelStyle: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
        unselectedLabelStyle: TextStyle(fontSize: 10, fontWeight: FontWeight.w500),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }

  // Compatibilidade com código existente
  static ThemeData get darkTheme => lightTheme;
}
