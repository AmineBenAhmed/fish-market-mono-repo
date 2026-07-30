'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/stores/cart';
import { QuantityPicker } from '@/components/quantity-picker';
import { AddressForm } from '@/components/address-form';
import { createOrder, calculateDeliveryFees } from '@/lib/api';
import { getAreaById, getZoneById } from '@fishmarket/shared';
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Fish,
  Loader2,
  User,
  Phone,
  MapPin,
  Edit,
} from 'lucide-react';
import { useLocale } from '@/stores/locale';
import type { AddressFormValue } from '@/components/address-form';

const STORAGE_KEY = 'fishmarket_customer';

interface CustomerDetails {
  name: string;
  phone: string;
  governorateId: string;
  areaId: string;
  zoneId: string;
  landmark: string;
}

function loadCustomer(): CustomerDetails | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCustomer(details: CustomerDetails) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  } catch {
    /* ignore */
  }
}

export default function CartPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const { t } = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [calculatingFees, setCalculatingFees] = useState(false);
  const [deliveryFees, setDeliveryFees] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressForm, setAddressForm] = useState<AddressFormValue>({
    governorateId: 'sousse',
    areaId: '',
    zoneId: '',
    landmark: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    const saved = loadCustomer();
    if (saved) {
      setCustomer(saved);
    } else {
      setShowDetailsForm(true);
    }
  }, []);

  useEffect(() => {
    if (!customer) return;
    const sellerIds = [...new Set(items.map((i) => i.sellerId).filter(Boolean))];
    if (sellerIds.length === 0) return;
    let cancelled = false;
    (async () => {
      setCalculatingFees(true);
      try {
        const res = await calculateDeliveryFees(customer.areaId, sellerIds);
        if (cancelled) return;
        const fees = res.data?.fees || {};
        for (const id of sellerIds) {
          if (fees[id] === undefined) fees[id] = 6;
        }
        setDeliveryFees(fees);
      } catch {
        /* silent — form will show 0s */
      }
      if (!cancelled) setCalculatingFees(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [customer, items]);

  const stores = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const group = map.get(item.sellerId);
      if (group) {
        group.push(item);
      } else {
        map.set(item.sellerId, [item]);
      }
    }
    return Array.from(map.entries());
  }, [items]);

  const storeCount = stores.length;
  const totalDelivery = stores.reduce((s, [id]) => s + (deliveryFees[id] || 0), 0);

  const validateDetails = () => {
    const errs: typeof fieldErrors = {};
    if (!name.trim()) errs.name = 'Le nom est requis';
    if (!phone.trim()) errs.phone = 'Le numéro de téléphone est requis';
    else if (!/^[\d\s+\-()]{7,20}$/.test(phone.trim())) errs.phone = 'Numéro de téléphone invalide';
    if (!addressForm.areaId) errs.address = "Veuillez remplir l'adresse complète";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveDetails = () => {
    if (!validateDetails()) return;

    const details: CustomerDetails = {
      name: name.trim(),
      phone: phone.trim(),
      governorateId: addressForm.governorateId,
      areaId: addressForm.areaId,
      zoneId: addressForm.zoneId,
      landmark: addressForm.landmark,
    };
    saveCustomer(details);
    setCustomer(details);
    setShowDetailsForm(false);
  };

  const handleEditDetails = () => {
    if (!customer) return;
    setName(customer.name);
    setPhone(customer.phone);
    setAddressForm({
      governorateId: customer.governorateId,
      areaId: customer.areaId,
      zoneId: customer.zoneId,
      landmark: customer.landmark,
    });
    setFieldErrors({});
    setIsEditing(true);
    setShowDetailsForm(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowDetailsForm(false);
    setFieldErrors({});
  };

  const handleConfirmOrder = async () => {
    if (!customer) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.landmark ? `بجانب ${customer.landmark}` : '',
        governorateId: customer.governorateId,
        areaId: customer.areaId,
        zoneId: customer.zoneId || undefined,
        landmark: customer.landmark || undefined,
        items: items.map((i) => ({
          listingId: i.listingId,
          quantity: i.quantity,
          cleaning: true,
        })),
      };
      await createOrder(payload);
      clearCart();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-20">
        <div className="bg-green-100 text-green-700 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Fish className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.orderPlaced')}</h2>
        <p className="text-gray-500 mb-6">{t('cart.thankYou')}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('cart.continueShopping')}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">{t('cart.empty')}</h2>
        <p className="text-gray-400 mb-6">{t('cart.addSomeFish')}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          {t('cart.browseListings')}
        </Link>
      </div>
    );
  }

  // ── Customer details form (first visit / edit) ──
  if (showDetailsForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Modifier vos coordonnées' : 'Vos coordonnées'}
        </h1>
        <p className="text-gray-500 mb-6">
          {isEditing
            ? 'Modifiez vos informations de livraison.'
            : 'Veuillez entrer vos informations pour finaliser votre commande.'}
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              Nom complet
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom complet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              Numéro de téléphone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Votre numéro de téléphone"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              Adresse de livraison
            </label>
            <AddressForm value={addressForm} onChange={setAddressForm} />
            {fieldErrors.address && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
            )}
          </div>

          <div className="flex gap-3">
            {isEditing && (
              <button
                onClick={handleCancelEdit}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-lg"
              >
                Annuler
              </button>
            )}
            <button
              onClick={handleSaveDetails}
              disabled={calculatingFees}
              className={`${isEditing ? 'flex-1' : 'w-full'} py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-lg`}
            >
              {calculatingFees
                ? 'Calcul des frais de livraison...'
                : isEditing
                  ? 'Enregistrer'
                  : 'Voir mon panier'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Cart with items ──
  return (
    <div className="max-w-3xl mx-auto px-0 sm:px-0">
      {/* Sticky header for mobile */}
      <div className="sticky top-14 sm:top-20 z-30 bg-white/95 backdrop-blur-sm -mx-3 sm:mx-0 px-3 sm:px-0 py-3 sm:py-0 sm:static sm:bg-transparent sm:backdrop-blur-none border-b sm:border-b-0 border-gray-100 sm:border-0 mb-3 sm:mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-2xl font-bold">{t('cart.shoppingCart')}</h1>
          <span className="text-xs sm:text-base text-gray-500">
            {itemCount} {t('cart.items')}
          </span>
        </div>
      </div>

      {/* Customer info summary */}
      {customer &&
        (() => {
          const area = customer.areaId
            ? getAreaById(customer.governorateId, customer.areaId)
            : null;
          const zone =
            customer.zoneId && area
              ? getZoneById(customer.governorateId, customer.areaId, customer.zoneId)
              : null;
          const addressParts = [area?.name, zone?.name, customer.landmark].filter(Boolean);
          return (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs sm:text-sm text-gray-700 space-y-0.5 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{customer.name}</p>
                  <p className="text-gray-500">{customer.phone}</p>
                  {addressParts.length > 0 && (
                    <p className="text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{addressParts.join('، ')}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={handleEditDetails}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Modifier données
                </button>
              </div>
            </div>
          );
        })()}

      {error && (
        <div className="bg-red-50 text-red-700 text-xs sm:text-sm p-2.5 sm:p-3 rounded-lg mb-3 sm:mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {stores.map(([sellerId, storeItems]) => {
          const storeName = storeItems[0].storeName;
          const currency = storeItems[0].currency;
          const storeSubtotal = storeItems.reduce(
            (s, i) => s + (i.price + i.cleaningCost) * i.quantity,
            0,
          );
          return (
            <div key={sellerId} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-100">
                <h2 className="font-bold text-sm sm:text-lg text-gray-900 truncate">{storeName}</h2>
                <span className="text-[10px] sm:text-xs text-gray-400 shrink-0">
                  {storeItems.length} article(s)
                </span>
              </div>
              <div className="space-y-3 sm:space-y-3">
                {storeItems.map((item) => (
                  <div
                    key={item.listingId}
                    className="flex items-start sm:items-center gap-2 sm:gap-4"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title === 'New Listing' ? item.storeName : item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Fish className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs sm:text-sm truncate">
                        {item.title === 'New Listing' ? item.storeName : item.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        {item.currency} {item.price.toFixed(2)} / {item.unit}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 shrink-0">
                      <QuantityPicker
                        value={item.quantity}
                        max={9999}
                        onChange={(q) => updateQuantity(item.listingId, q)}
                      />
                      <div className="flex items-center gap-1 sm:gap-2">
                        <p className="font-semibold text-blue-600 text-[11px] sm:text-sm text-right w-auto sm:w-20">
                          {((item.price + item.cleaningCost) * item.quantity).toFixed(2)}{' '}
                          {item.currency}
                        </p>
                        <button
                          onClick={() => removeItem(item.listingId)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 space-y-0.5 sm:space-y-1 text-[11px] sm:text-sm">
                <div className="flex items-center justify-between text-gray-500">
                  <span>
                    {t('cart.subtotal')}{' '}
                    <span className="text-[10px] text-gray-400">(y inclus frais de nettoyage)</span>
                  </span>
                  <span>
                    {currency} {storeSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Frais de livraison</span>
                  <span>
                    {currency} {(deliveryFees[sellerId] || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky summary on mobile */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-3 sm:mx-0 px-3 sm:px-0 sm:static sm:border-none sm:bg-transparent mt-4 sm:mt-8">
        <div className="sm:bg-white sm:rounded-xl sm:border sm:border-gray-200 sm:p-6 pt-3 sm:pt-6 pb-3 sm:pb-6">
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm mb-3 sm:mb-4">
            <div className="flex items-center justify-between text-gray-500">
              <span>
                {t('cart.subtotal')}{' '}
                <span className="text-[10px] text-gray-400">(y inclus frais de nettoyage)</span>
              </span>
              <span>
                {items[0]?.currency || 'TND'} {total.toFixed(2)}
              </span>
            </div>
            {Object.keys(deliveryFees).length > 0 && (
              <div className="flex items-center justify-between text-gray-500">
                <span>
                  Total frais de livraison ({storeCount} boutique{storeCount > 1 ? 's' : ''})
                </span>
                <span>
                  {items[0]?.currency || 'TND'} {totalDelivery.toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t pt-1.5 sm:pt-2 flex items-center justify-between text-base sm:text-lg">
              <span className="font-semibold">{t('cart.total')}</span>
              <span className="font-bold text-lg sm:text-xl text-blue-600">
                {items[0]?.currency || 'TND'} {(total + totalDelivery).toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={handleConfirmOrder}
            disabled={submitting}
            className="w-full py-2.5 sm:py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors text-sm sm:text-lg"
          >
            {submitting ? 'Traitement en cours...' : 'Je confirme'}
          </button>
        </div>
      </div>
    </div>
  );
}
