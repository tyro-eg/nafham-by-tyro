import { Streami18n } from 'stream-chat-react';

/**
 * Arabic strings for the Stream Chat UI. Stream ships no Arabic bundle,
 * so the most visible keys are translated here; anything missing falls
 * back to English.
 */
const arabic: Record<string, string> = {
  'Type your message': 'اكتب رسالتك',
  Send: 'إرسال',
  Cancel: 'إلغاء',
  Delete: 'حذف',
  Edit: 'تعديل',
  Reply: 'رد',
  'Edit Message': 'تعديل الرسالة',
  'Delete message': 'حذف الرسالة',
  'Delete Message': 'حذف الرسالة',
  'Are you sure you want to permanently delete this message?':
    'هل تريد حذف هذه الرسالة نهائياً؟',
  'This message was deleted...': 'تم حذف هذه الرسالة',
  'Message deleted': 'تم حذف الرسالة',
  'Message Failed · Click to try again': 'فشل الإرسال · اضغط للمحاولة مرة أخرى',
  'Message Failed · Unauthorized': 'فشل الإرسال · غير مصرح',
  Attach: 'إرفاق',
  'Attach files': 'إرفاق ملفات',
  File: 'ملف',
  'Upload file': 'رفع ملف',
  'Upload failed': 'فشل الرفع',
  'Download attachment {{ name }}': 'تحميل المرفق {{ name }}',
  'Drag your files here': 'اسحب ملفاتك هنا',
  'Drag your files here to add to your post': 'اسحب ملفاتك هنا لإضافتها',
  'Start recording': 'ابدأ التسجيل',
  'Stop recording': 'أوقف التسجيل',
  'Pause recording': 'إيقاف مؤقت',
  'Resume recording': 'استئناف التسجيل',
  'Play audio': 'تشغيل الصوت',
  'Pause audio': 'إيقاف الصوت',
  'Voice message': 'رسالة صوتية',
  'Voice Recording': 'رسالة صوتية',
  Recording: 'جارٍ التسجيل',
  'Allow access to microphone': 'اسمح بالوصول إلى الميكروفون',
  'To start recording, allow the microphone access in your browser':
    'للبدء في التسجيل، اسمح للمتصفح بالوصول إلى الميكروفون',
  'Nothing yet...': 'لا توجد رسائل بعد',
  'No chats here yet…': 'لا توجد محادثات بعد',
  'Start of a new conversation': 'بداية محادثة جديدة',
  'This is the start of your chat history.': 'هذه بداية سجل محادثتكم.',
  'Load more': 'تحميل المزيد',
  'Loading...': 'جارٍ التحميل…',
  Connecting: 'جارٍ الاتصال',
  'Connection failure, reconnecting now...':
    'انقطع الاتصال، جارٍ إعادة الاتصال…',
  'Error: {{ errorMessage }}': 'خطأ: {{ errorMessage }}',
  'Failed to jump to the latest message': 'تعذر الانتقال إلى آخر رسالة',
  'New Messages!': 'رسائل جديدة!',
  'Unread messages': 'رسائل غير مقروءة',
  Unread: 'غير مقروء',
  'Mark as unread': 'تحديد كغير مقروء',
  'Mark as read': 'تحديد كمقروء',
  Pin: 'تثبيت',
  Unpin: 'إلغاء التثبيت',
  'Pinned by': 'ثبّتها',
  '{{ user }} is typing...': '{{ user }} يكتب…',
  '{{ users }} and {{ user }} are typing...': '{{ users }} و{{ user }} يكتبون…',
  '{{ users }} and more are typing...': '{{ users }} وآخرون يكتبون…',
  Today: 'اليوم',
  Yesterday: 'أمس',
  'Message options': 'خيارات الرسالة',
  Reactions: 'التفاعلات',
  Search: 'بحث',
  'Send message': 'إرسال الرسالة',
  Mute: 'كتم',
  Unmute: 'إلغاء الكتم',
  Flag: 'إبلاغ',
  'Copy text': 'نسخ النص',
  'Reply to Message': 'الرد على الرسالة',
  Quote: 'اقتباس',
};

const instances: Partial<Record<'en' | 'ar', Streami18n>> = {};

/** One Streami18n per language, created on first use. */
export const getStreamI18n = (language: string): Streami18n => {
  const lang = language.startsWith('ar') ? 'ar' : 'en';
  if (!instances[lang]) {
    const instance = new Streami18n({ language: 'en' });
    if (lang === 'ar') {
      instance.registerTranslation('ar', arabic);
      instance.setLanguage('ar');
    }
    instances[lang] = instance;
  }
  return instances[lang]!;
};
