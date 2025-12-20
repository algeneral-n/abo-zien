/**
 * RARE 4N - Typography System
 * نظام الخطوط الموحد
 */

export const typography = {
  // Font Sizes - أحجام الخطوط الموحدة
  fontSize: {
    xs: 10,    // Extra small - للتفاصيل الصغيرة جداً
    sm: 12,    // Small - للتفاصيل والمعلومات الثانوية
    base: 14,  // Base - النص الأساسي والمحتوى
    md: 16,    // Medium - للعناوين الفرعية والأزرار
    lg: 18,    // Large - للعناوين الثانوية
    xl: 20,    // Extra Large - لعناوين الصفحات
    '2xl': 24, // للعناوين الرئيسية
    '3xl': 32, // للأرقام والإحصائيات الكبيرة
  },

  // Font Weights - أوزان الخطوط
  fontWeight: {
    regular: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },

  // Line Heights - ارتفاع الأسطر
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font Families - عائلات الخطوط
  fontFamily: {
    default: 'System', // النظام الافتراضي
    mono: 'monospace', // للكود والـ Terminal
  },
};

// Text Styles - أنماط النصوص الجاهزة
export const textStyles = {
  // Headers - العناوين
  h1: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
  },
  h4: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
  },

  // Body Text - النصوص الأساسية
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
  },

  // Buttons - الأزرار
  button: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  buttonSmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  // Labels - التسميات
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  labelSmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  // Caption - التوضيحات
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
  },

  // Monospace - للكود
  code: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    lineHeight: typography.lineHeight.relaxed,
  },
};

// Helper function to get text style
export const getTextStyle = (style: keyof typeof textStyles) => {
  return textStyles[style];
};

export default {
  typography,
  textStyles,
  getTextStyle,
};


