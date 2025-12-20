/**
 * RARE 4N - Systems Library
 * مكتبة الأنظمة - 50+ نظام عمل
 */

export const SYSTEMS_LIBRARY = [
  // Sales & Inventory Systems
  { id: 'sales-system', name: 'نظام المبيعات', nameEn: 'Sales System', category: 'business', description: 'نظام إدارة المبيعات الكامل - للمحلات والسوبر ماركت' },
  { id: 'inventory-system', name: 'نظام المخزون', nameEn: 'Inventory System', category: 'business', description: 'إدارة المخزون والمستودعات - تتبع المنتجات والكميات' },
  { id: 'pos-system', name: 'نظام نقاط البيع (POS)', nameEn: 'POS System', category: 'business', description: 'نظام نقاط البيع للمحلات والسوبر ماركت - فواتير ومبيعات' },
  { id: 'retail-system', name: 'نظام البيع بالتجزئة', nameEn: 'Retail System', category: 'business', description: 'نظام متكامل للمحلات - مبيعات ومخزون وعملاء' },
  { id: 'supermarket-system', name: 'نظام السوبر ماركت', nameEn: 'Supermarket System', category: 'business', description: 'نظام شامل للسوبر ماركت - مبيعات ومخزون وموردين' },
  { id: 'store-management', name: 'إدارة المتجر', nameEn: 'Store Management', category: 'business', description: 'إدارة شاملة للمتجر - منتجات ومبيعات وعملاء' },
  { id: 'purchasing-system', name: 'نظام المشتريات', nameEn: 'Purchasing System', category: 'business', description: 'إدارة المشتريات والطلبات - للمحلات والسوبر ماركت' },
  { id: 'supplier-management', name: 'إدارة الموردين', nameEn: 'Supplier Management', category: 'business', description: 'إدارة الموردين والطلبات - للمحلات والسوبر ماركت' },
  { id: 'accounting-system', name: 'نظام المحاسبة', nameEn: 'Accounting System', category: 'business', description: 'نظام محاسبة متكامل - للمحلات والسوبر ماركت' },
  { id: 'commerce-system', name: 'نظام التجارة', nameEn: 'Commerce System', category: 'business', description: 'نظام تجارة إلكترونية' },
  { id: 'barcode-system', name: 'نظام الباركود', nameEn: 'Barcode System', category: 'business', description: 'مسح وطباعة الباركود - للمنتجات' },
  { id: 'receipt-system', name: 'نظام الفواتير', nameEn: 'Receipt System', category: 'business', description: 'طباعة وإدارة الفواتير - للمحلات' },
  
  // Social Media Systems
  { id: 'social-media-system', name: 'نظام السوشيال ميديا', nameEn: 'Social Media System', category: 'social', description: 'إدارة منصات التواصل' },
  { id: 'content-management', name: 'إدارة المحتوى', nameEn: 'Content Management', category: 'social', description: 'إدارة المحتوى والنشر' },
  { id: 'analytics-system', name: 'نظام التحليلات', nameEn: 'Analytics System', category: 'social', description: 'تحليل البيانات والإحصائيات' },
  
  // Communication Systems
  { id: 'messaging-system', name: 'نظام المراسلة', nameEn: 'Messaging System', category: 'communication', description: 'نظام مراسلة فوري' },
  { id: 'video-call-system', name: 'نظام المكالمات المرئية', nameEn: 'Video Call System', category: 'communication', description: 'مكالمات فيديو' },
  { id: 'notification-system', name: 'نظام الإشعارات', nameEn: 'Notification System', category: 'communication', description: 'إدارة الإشعارات' },
  
  // Additional Systems (to reach 50+)
  { id: 'hr-system', name: 'نظام الموارد البشرية', nameEn: 'HR System', category: 'business', description: 'إدارة الموارد البشرية' },
  { id: 'crm-system', name: 'نظام إدارة العملاء', nameEn: 'CRM System', category: 'business', description: 'إدارة علاقات العملاء' },
  { id: 'project-management', name: 'إدارة المشاريع', nameEn: 'Project Management', category: 'business', description: 'إدارة المشاريع والمهام' },
  { id: 'taREDACTED', name: 'إدارة المهام', nameEn: 'Task Management', category: 'business', description: 'تنظيم المهام' },
  { id: 'document-management', name: 'إدارة المستندات', nameEn: 'Document Management', category: 'business', description: 'إدارة المستندات' },
  { id: 'file-storage', name: 'تخزين الملفات', nameEn: 'File Storage', category: 'storage', description: 'نظام تخزين الملفات' },
  { id: 'backup-system', name: 'نظام النسخ الاحتياطي', nameEn: 'Backup System', category: 'storage', description: 'نسخ احتياطي تلقائي' },
  { id: 'security-system', name: 'نظام الأمان', nameEn: 'Security System', category: 'security', description: 'حماية وأمان' },
  { id: 'authentication-system', name: 'نظام المصادقة', nameEn: 'Authentication System', category: 'security', description: 'مصادقة متعددة الطبقات' },
  { id: 'payment-system', name: 'نظام الدفع', nameEn: 'Payment System', category: 'payment', description: 'معالجة المدفوعات' },
  { id: 'subscription-system', name: 'نظام الاشتراكات', nameEn: 'Subscription System', category: 'payment', description: 'إدارة الاشتراكات' },
  { id: 'billing-system', name: 'نظام الفوترة', nameEn: 'Billing System', category: 'payment', description: 'إصدار الفواتير' },
  { id: 'reporting-system', name: 'نظام التقارير', nameEn: 'Reporting System', category: 'analytics', description: 'إنشاء التقارير' },
  { id: 'dashboard-system', name: 'نظام لوحة التحكم', nameEn: 'Dashboard System', category: 'analytics', description: 'لوحة تحكم تفاعلية' },
  { id: 'calendar-system', name: 'نظام التقويم', nameEn: 'Calendar System', category: 'productivity', description: 'إدارة المواعيد' },
  { id: 'reminder-system', name: 'نظام التذكيرات', nameEn: 'Reminder System', category: 'productivity', description: 'تذكيرات ذكية' },
  { id: 'note-taking', name: 'تدوين الملاحظات', nameEn: 'Note Taking', category: 'productivity', description: 'تدوين وتنظيم الملاحظات' },
  { id: 'email-system', name: 'نظام البريد الإلكتروني', nameEn: 'Email System', category: 'communication', description: 'إدارة البريد' },
  { id: 'contact-management', name: 'إدارة جهات الاتصال', nameEn: 'Contact Management', category: 'communication', description: 'تنظيم جهات الاتصال' },
  { id: 'event-management', name: 'إدارة الفعاليات', nameEn: 'Event Management', category: 'productivity', description: 'تنظيم الفعاليات' },
  { id: 'booking-system', name: 'نظام الحجوزات', nameEn: 'Booking System', category: 'business', description: 'إدارة الحجوزات' },
  { id: 'review-system', name: 'نظام التقييمات', nameEn: 'Review System', category: 'social', description: 'تقييمات ومراجعات' },
  { id: 'rating-system', name: 'نظام التقييم', nameEn: 'Rating System', category: 'social', description: 'نظام تقييم' },
  { id: 'search-system', name: 'نظام البحث', nameEn: 'Search System', category: 'utility', description: 'بحث متقدم' },
  { id: 'filter-system', name: 'نظام التصفية', nameEn: 'Filter System', category: 'utility', description: 'تصفية وفرز' },
  { id: 'sorting-system', name: 'نظام الترتيب', nameEn: 'Sorting System', category: 'utility', description: 'ترتيب البيانات' },
  { id: 'export-system', name: 'نظام التصدير', nameEn: 'Export System', category: 'utility', description: 'تصدير البيانات' },
  { id: 'import-system', name: 'نظام الاستيراد', nameEn: 'Import System', category: 'utility', description: 'استيراد البيانات' },
  { id: 'sync-system', name: 'نظام المزامنة', nameEn: 'Sync System', category: 'utility', description: 'مزامنة البيانات' },
  { id: 'cache-system', name: 'نظام التخزين المؤقت', nameEn: 'Cache System', category: 'utility', description: 'تخزين مؤقت' },
  { id: 'logging-system', name: 'نظام السجلات', nameEn: 'Logging System', category: 'utility', description: 'تسجيل الأحداث' },
  { id: 'monitoring-system', name: 'نظام المراقبة', nameEn: 'Monitoring System', category: 'utility', description: 'مراقبة الأداء' },
  { id: 'error-tracking', name: 'تتبع الأخطاء', nameEn: 'Error Tracking', category: 'utility', description: 'تتبع ومعالجة الأخطاء' },
  { id: 'performance-system', name: 'نظام الأداء', nameEn: 'Performance System', category: 'utility', description: 'تحسين الأداء' },
  { id: 'optimization-system', name: 'نظام التحسين', nameEn: 'Optimization System', category: 'utility', description: 'تحسين تلقائي' },
  { id: 'ai-assistant', name: 'مساعد ذكي', nameEn: 'AI Assistant', category: 'ai', description: 'مساعد ذكي' },
  { id: 'chatbot-system', name: 'نظام الدردشة الآلية', nameEn: 'Chatbot System', category: 'ai', description: 'دردشة آلية' },
  { id: 'nlp-system', name: 'نظام معالجة اللغة', nameEn: 'NLP System', category: 'ai', description: 'معالجة اللغة الطبيعية' },
  { id: 'translation-system', name: 'نظام الترجمة', nameEn: 'Translation System', category: 'ai', description: 'ترجمة متعددة اللغات' },
  { id: 'voice-recognition', name: 'التعرف على الصوت', nameEn: 'Voice Recognition', category: 'ai', description: 'تعرف على الصوت' },
  { id: 'image-recognition', name: 'التعرف على الصور', nameEn: 'Image Recognition', category: 'ai', description: 'تحليل الصور' },
  { id: 'recommendation-system', name: 'نظام التوصيات', nameEn: 'Recommendation System', category: 'ai', description: 'توصيات ذكية' },
  { id: 'learning-system', name: 'نظام التعلم', nameEn: 'Learning System', category: 'ai', description: 'تعلم آلي' },
];








