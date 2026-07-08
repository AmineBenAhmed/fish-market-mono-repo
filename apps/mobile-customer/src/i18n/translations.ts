export type Locale = 'en' | 'fr' | 'ar';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};

const translations: Record<string, Record<Locale, string>> = {
  'header.tagline': {
    en: 'Fresh fish market in Tunisia',
    fr: 'Poisson frais en Tunisie',
    ar: 'سوق السمك الطازج في تونس',
  },
  'header.cart': { en: 'Cart', fr: 'Panier', ar: 'السلة' },

  'sidebar.brand': { en: 'FishMarket', fr: 'FishMarket', ar: 'فيش ماركت' },
  'sidebar.searchPlaceholder': {
    en: 'Search categories…',
    fr: 'Rechercher des catégories…',
    ar: 'بحث عن فئات…',
  },
  'sidebar.clear': { en: 'Clear', fr: 'Effacer', ar: 'مسح' },
  'sidebar.preservation': { en: 'Preservation', fr: 'Conservation', ar: 'الحفظ' },
  'sidebar.fresh': { en: 'Fresh', fr: 'Frais', ar: 'طازج' },
  'sidebar.frozen': { en: 'Frozen', fr: 'Congelé', ar: 'مجمد' },
  'sidebar.prepared': { en: 'Prepared', fr: 'Préparé', ar: 'مجهز' },
  'sidebar.allCategories': { en: 'All Categories', fr: 'Toutes les Catégories', ar: 'جميع الفئات' },
  'sidebar.noMatch': {
    en: 'No categories match',
    fr: 'Aucune catégorie trouvée',
    ar: 'لا توجد فئات مطابقة',
  },
  'sidebar.clearSearch': { en: 'Clear search', fr: 'Effacer la recherche', ar: 'مسح البحث' },

  'home.heroAlt': {
    en: 'Fresh fish market',
    fr: 'Marché de poisson frais',
    ar: 'سوق السمك الطازج',
  },
  'home.heroTitle': {
    en: 'Fresh Fish Market',
    fr: 'Marché de Poisson Frais',
    ar: 'سوق السمك الطازج',
  },
  'home.heroSubtitle': {
    en: 'Sourced directly from local fishermen',
    fr: 'Directement des pêcheurs locaux',
    ar: 'مباشرة من الصيادين المحليين',
  },
  'home.allCategories': { en: 'All Categories', fr: 'Toutes les Catégories', ar: 'جميع الفئات' },
  'home.categories': { en: 'categories', fr: 'catégories', ar: 'فئات' },
  'home.more': { en: 'More', fr: 'Plus', ar: 'المزيد' },
  'home.filteredListings': {
    en: 'Filtered Listings',
    fr: 'Annonces Filtrées',
    ar: 'الإعلانات المصفاة',
  },
  'home.listings': { en: 'Listings', fr: 'Annonces', ar: 'الإعلانات' },
  'home.listing': { en: 'listing', fr: 'annonce', ar: 'إعلان' },
  'home.listings_plural': { en: 'listings', fr: 'annonces', ar: 'إعلانات' },
  'home.available': { en: 'available', fr: 'disponibles', ar: 'متاحة' },
  'home.noListings': {
    en: 'No listings available in this category',
    fr: 'Aucune annonce disponible dans cette catégorie',
    ar: 'لا توجد إعلانات متاحة في هذه الفئة',
  },
  'home.tryDifferent': {
    en: 'Try selecting a different category',
    fr: 'Essayez de sélectionner une autre catégorie',
    ar: 'حاول اختيار فئة مختلفة',
  },

  'listing.notFound': {
    en: 'Listing not found',
    fr: 'Annonce introuvable',
    ar: 'الإعلان غير موجود',
  },
  'listing.backToListings': {
    en: 'Back to listings',
    fr: 'Retour aux annonces',
    ar: 'العودة إلى الإعلانات',
  },
  'listing.general': { en: 'General', fr: 'Général', ar: 'عام' },
  'listing.back': { en: 'Back', fr: 'Retour', ar: 'رجوع' },
  'listing.origin': { en: 'Origin', fr: 'Origine', ar: 'المنشأ' },
  'listing.condition': { en: 'Condition', fr: 'Condition', ar: 'الحالة' },
  'listing.avgWeight': { en: 'Avg. Weight', fr: 'Poids Moy.', ar: 'متوسط الوزن' },
  'listing.kg': { en: 'kg', fr: 'kg', ar: 'كغ' },
  'listing.available': { en: 'Available', fr: 'Disponible', ar: 'متاح' },
  'listing.catchDate': { en: 'Catch Date', fr: 'Date de Pêche', ar: 'تاريخ الصيد' },
  'listing.quantity': { en: 'Quantity', fr: 'Quantité', ar: 'الكمية' },
  'listing.cleanFish': { en: 'Clean fish', fr: 'Nettoyer le poisson', ar: 'تنظيف السمك' },
  'listing.subtotal': { en: 'Subtotal', fr: 'Sous-total', ar: 'المجموع الفرعي' },
  'listing.total': { en: 'Total', fr: 'Total', ar: 'المجموع' },
  'listing.addedToCart': {
    en: 'Added to Cart!',
    fr: 'Ajouté au Panier!',
    ar: 'تمت الإضافة إلى السلة!',
  },
  'listing.addToCart': { en: 'Add to Cart', fr: 'Ajouter au Panier', ar: 'أضف إلى السلة' },
  'listing.moreFrom': { en: 'More from', fr: 'Plus de', ar: 'المزيد من' },
  'listing.added': { en: 'Added!', fr: 'Ajouté!', ar: 'تمت!' },
  'listing.add': { en: 'Add', fr: 'Ajouter', ar: 'إضافة' },

  'cart.orderPlaced': { en: 'Order Placed!', fr: 'Commande Passée!', ar: 'تم تقديم الطلب!' },
  'cart.thankYou': {
    en: 'Thank you for your order. We will contact you soon.',
    fr: 'Merci pour votre commande. Nous vous contacterons bientôt.',
    ar: 'شكرا لطلبك. سوف نتصل بك قريبا.',
  },
  'cart.continueShopping': {
    en: 'Continue Shopping',
    fr: 'Continuer vos Achats',
    ar: 'مواصلة التسوق',
  },
  'cart.empty': { en: 'Your cart is empty', fr: 'Votre panier est vide', ar: 'سلتك فارغة' },
  'cart.addSomeFish': {
    en: 'Add some fish from the market',
    fr: 'Ajoutez du poisson du marché',
    ar: 'أضف بعض الأسماك من السوق',
  },
  'cart.browseListings': {
    en: 'Browse Listings',
    fr: 'Parcourir les Annonces',
    ar: 'تصفح الإعلانات',
  },
  'cart.shoppingCart': { en: 'Shopping Cart', fr: "Panier d'achat", ar: 'سلة التسوق' },
  'cart.items': { en: 'items', fr: 'articles', ar: 'عناصر' },
  'cart.cleaning': { en: 'Cleaning', fr: 'Nettoyage', ar: 'تنظيف' },
  'cart.subtotal': { en: 'Subtotal', fr: 'Sous-total', ar: 'المجموع الفرعي' },
  'cart.cleaningFee': { en: 'Cleaning Fee', fr: 'Frais de Nettoyage', ar: 'رسوم التنظيف' },
  'cart.total': { en: 'Total', fr: 'Total', ar: 'المجموع' },
  'cart.proceedToCheckout': {
    en: 'Proceed to Checkout',
    fr: 'Je confirme',
    ar: 'متابعة الدفع',
  },

  'checkout.confirmOrder': { en: 'Confirm Order', fr: 'Confirmer la Commande', ar: 'تأكيد الطلب' },
  'checkout.fullName': { en: 'Full Name', fr: 'Nom Complet', ar: 'الاسم الكامل' },
  'checkout.fullNamePlaceholder': { en: 'John Doe', fr: 'Jean Dupont', ar: 'محمد أحمد' },
  'checkout.phoneNumber': { en: 'Phone Number', fr: 'Numéro de Téléphone', ar: 'رقم الهاتف' },
  'checkout.phonePlaceholder': {
    en: '+216 99 999 999',
    fr: '+216 99 999 999',
    ar: '+216 99 999 999',
  },
  'checkout.fullAddress': { en: 'Full Address', fr: 'Adresse Complète', ar: 'العنوان الكامل' },
  'checkout.addressPlaceholder': {
    en: 'Street, city, postal code...',
    fr: 'Rue, ville, code postal...',
    ar: 'الشارع، المدينة، الرمز البريدي...',
  },
  'checkout.processing': { en: 'Processing...', fr: 'Traitement...', ar: 'جاري المعالجة...' },
  'checkout.placeOrder': { en: 'Place Order', fr: 'Passer la Commande', ar: 'تقديم الطلب' },
  'checkout.nameRequired': {
    en: 'Full name is required',
    fr: 'Le nom complet est requis',
    ar: 'الاسم الكامل مطلوب',
  },
  'checkout.phoneRequired': {
    en: 'Phone number is required',
    fr: 'Le numéro de téléphone est requis',
    ar: 'رقم الهاتف مطلوب',
  },
  'checkout.phoneInvalid': {
    en: 'Enter a valid phone number',
    fr: 'Entrez un numéro de téléphone valide',
    ar: 'أدخل رقم هاتف صحيح',
  },
  'checkout.addressRequired': {
    en: 'Full address is required',
    fr: "L'adresse complète est requise",
    ar: 'العنوان الكامل مطلوب',
  },

  'notFound.title': { en: 'Page Not Found', fr: 'Page Introuvable', ar: 'الصفحة غير موجودة' },
  'notFound.description': {
    en: 'The page you are looking for does not exist.',
    fr: "La page que vous cherchez n'existe pas.",
    ar: 'الصفحة التي تبحث عنها غير موجودة.',
  },
  'notFound.goHome': { en: 'Go Home', fr: 'Accueil', ar: 'الرئيسية' },

  'error.title': {
    en: 'Something went wrong',
    fr: "Quelque chose s'est mal passé",
    ar: 'حدث خطأ ما',
  },
  'error.tryAgain': { en: 'Try again', fr: 'Réessayer', ar: 'حاول مرة أخرى' },
};

export function getTranslation(key: string, locale: Locale): string {
  return translations[key]?.[locale] ?? key;
}

export function getDir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
