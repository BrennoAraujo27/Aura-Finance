import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Cores Primárias - Midnight Obsidian
  static const Color bgDeep = Color(0xFF070A11);
  static const Color bgSurface = Color(0xFF0E131F);
  static const Color bgCard = Color(0xFF121929);
  static const Color bgCardHover = Color(0xFF1A243A);
  static const Color borderGlass = Color(0x1FFFFFFF);

  // Acentos Neon Fintech
  static const Color accentEmerald = Color(0xFF00F090);
  static const Color accentCyan = Color(0xFF00D2FF);
  static const Color accentPurple = Color(0xFF9D4EDD);
  static const Color accentAmber = Color(0xFFFFB703);
  static const Color accentCoral = Color(0xFFFF3B5C);

  // Tipografia & Textos
  static const Color textWhite = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFFF0F4FC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgDeep,
      primaryColor: accentEmerald,
      cardColor: bgCard,
      colorScheme: const ColorScheme.dark(
        primary: accentEmerald,
        secondary: accentCyan,
        surface: bgSurface,
        error: accentCoral,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(
        ThemeData.dark().textTheme,
      ).apply(
        bodyColor: textPrimary,
        displayColor: textWhite,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgSurface,
        elevation: 0,
        centerTitle: false,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bgSurface,
        selectedItemColor: accentCyan,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
