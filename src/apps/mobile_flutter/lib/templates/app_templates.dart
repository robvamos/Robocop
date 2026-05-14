import 'package:flutter/material.dart';

enum AppTemplateId {
  mission,
  tactical,
  lightOps,
  rescue,
}

class AppTemplate {
  const AppTemplate({
    required this.id,
    required this.name,
    required this.description,
    required this.background,
    required this.surface,
    required this.surfaceAlt,
    required this.primary,
    required this.secondary,
    required this.danger,
    required this.warning,
    required this.success,
    required this.text,
    required this.muted,
  });

  final AppTemplateId id;
  final String name;
  final String description;
  final Color background;
  final Color surface;
  final Color surfaceAlt;
  final Color primary;
  final Color secondary;
  final Color danger;
  final Color warning;
  final Color success;
  final Color text;
  final Color muted;

  ThemeData toTheme() {
    final scheme = ColorScheme.fromSeed(
      seedColor: primary,
      brightness: background.computeLuminance() < 0.45
          ? Brightness.dark
          : Brightness.light,
      primary: primary,
      secondary: secondary,
      surface: surface,
      error: danger,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: background,
      cardTheme: CardTheme(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          minimumSize: const Size(44, 44),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          minimumSize: const Size(44, 44),
        ),
      ),
      segmentedButtonTheme: SegmentedButtonThemeData(
        style: ButtonStyle(
          shape: MaterialStatePropertyAll(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
      ),
      textTheme: const TextTheme().apply(
        bodyColor: text,
        displayColor: text,
      ),
    );
  }
}

const appTemplates = <AppTemplate>[
  AppTemplate(
    id: AppTemplateId.mission,
    name: 'Mission Control',
    description: 'Scuro, tecnico, alta leggibilita in movimento.',
    background: Color(0xFF101415),
    surface: Color(0xFF182022),
    surfaceAlt: Color(0xFF223034),
    primary: Color(0xFF24C8DB),
    secondary: Color(0xFF96D45A),
    danger: Color(0xFFFF5A5F),
    warning: Color(0xFFF5B84B),
    success: Color(0xFF56D68A),
    text: Color(0xFFEAF4F5),
    muted: Color(0xFF98A8AA),
  ),
  AppTemplate(
    id: AppTemplateId.tactical,
    name: 'Tactical Amber',
    description: 'Contrasto caldo per guida serale e diagnostica.',
    background: Color(0xFF17130E),
    surface: Color(0xFF241D15),
    surfaceAlt: Color(0xFF33291E),
    primary: Color(0xFFFFB02E),
    secondary: Color(0xFF57C7FF),
    danger: Color(0xFFE34E3B),
    warning: Color(0xFFFFD166),
    success: Color(0xFF77D970),
    text: Color(0xFFFFF4E0),
    muted: Color(0xFFC2AD8F),
  ),
  AppTemplate(
    id: AppTemplateId.lightOps,
    name: 'Light Ops',
    description: 'Chiaro e pulito per uso indoor e setup.',
    background: Color(0xFFF4F7F8),
    surface: Color(0xFFFFFFFF),
    surfaceAlt: Color(0xFFE7EEF0),
    primary: Color(0xFF006E7F),
    secondary: Color(0xFF6A5ACD),
    danger: Color(0xFFC62828),
    warning: Color(0xFFE58A00),
    success: Color(0xFF1F8F4D),
    text: Color(0xFF172124),
    muted: Color(0xFF617176),
  ),
  AppTemplate(
    id: AppTemplateId.rescue,
    name: 'Rescue Field',
    description: 'Palette operativa per pattugliamento e sicurezza.',
    background: Color(0xFF101713),
    surface: Color(0xFF1B261F),
    surfaceAlt: Color(0xFF26362B),
    primary: Color(0xFFECE15A),
    secondary: Color(0xFF49C19A),
    danger: Color(0xFFFF6B4A),
    warning: Color(0xFFFFC857),
    success: Color(0xFF63D471),
    text: Color(0xFFF4F7E8),
    muted: Color(0xFFAAB5A4),
  ),
];
