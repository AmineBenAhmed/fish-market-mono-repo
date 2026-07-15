'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/stores/cart';
import { QuantityPicker } from '@/components/quantity-picker';
import { AddressForm } from '@/components/address-form';
import { createOrder, calculateDeliveryFees } from '@/lib/api';
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Fish,
  Loader2,
  Check,
  User,
  Phone,
  MapPin,
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
  street: string;
  buildingNumber: string;
  apartment: string;
  floor: string;
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

  const { items, total, itemCount, updateQuantity, removeItem, toggleCleaning, clearCart } =
    useCart();
  const { t } = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [calculatingFees, setCalculatingFees] = useState(false);
  const [deliveryFees, setDeliveryFees] = useState<Record<string, number>>({});

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressForm, setAddressForm] = useState<AddressFormValue>({
    governorateId: 'sousse',
    areaId: '',
    zoneId: '',
    street: '',
    buildingNumber: '',
    apartment: '',
    floor: '',
    landmark: '',
    label: '',
    lat: '',
    lng: '',
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
  const totalCleaning = items.reduce(
    (s, i) => s + (i.cleaning ? i.cleaningCost * i.quantity : 0),
    0,
  );

  const validateDetails = () => {
    const errs: typeof fieldErrors = {};
    if (!name.trim()) errs.name = 'Le nom est requis';
    if (!phone.trim()) errs.phone = 'Le numéro de téléphone est requis';
    else if (!/^[\d\s+\-()]{7,20}$/.test(phone.trim())) errs.phone = 'Numéro de téléphone invalide';
    if (!addressForm.areaId || !addressForm.zoneId)
      errs.address = "Veuillez remplir l'adresse complète";
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
      street: addressForm.street,
      buildingNumber: addressForm.buildingNumber,
      apartment: addressForm.apartment,
      floor: addressForm.floor,
      landmark: addressForm.landmark,
    };
    saveCustomer(details);
    setCustomer(details);
    setShowDetailsForm(false);
  };

  const handleConfirmOrder = async () => {
    if (!customer) return;
    setSubmitting(true);
    setError(null);
    try {
      const parts: string[] = [];
      if (customer.street) parts.push(customer.street);
      if (customer.buildingNumber) parts.push(`بناية ${customer.buildingNumber}`);
      if (customer.floor) parts.push(`طابق ${customer.floor}`);
      if (customer.apartment) parts.push(`شقة ${customer.apartment}`);
      if (customer.landmark) parts.push(`بجانب ${customer.landmark}`);

      const payload = {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: parts.join('، ') || customer.street,
        governorateId: customer.governorateId,
        areaId: customer.areaId,
        zoneId: customer.zoneId,
        street: customer.street,
        buildingNumber: customer.buildingNumber || undefined,
        apartment: customer.apartment || undefined,
        floor: customer.floor || undefined,
        landmark: customer.landmark || undefined,
        items: items.map((i) => ({
          listingId: i.listingId,
          quantity: i.quantity,
          cleaning: i.cleaning,
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

  // ── Customer details form (first visit) ──
  if (showDetailsForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Vos coordonnées</h1>
        <p className="text-gray-500 mb-6">
          Veuillez entrer vos informations pour finaliser votre commande.
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
            <AddressForm
              value={addressForm}
              onChange={setAddressForm}
              showLabel={false}
              showCoordinates={false}
            />
            {fieldErrors.address && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
            )}
          </div>

          <button
            onClick={handleSaveDetails}
            disabled={calculatingFees}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-lg"
          >
            {calculatingFees ? 'Calcul des frais de livraison...' : 'Voir mon panier'}
          </button>
        </div>
      </div>
    );
  }

  // ── Cart with items ──
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('cart.shoppingCart')}</h1>
        <span className="text-gray-500">
          {itemCount} {t('cart.items')}
        </span>
      </div>

      {/* Customer info summary */}
      {customer && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-gray-700">
          <p>
            <strong>{customer.name}</strong> &middot; {customer.phone}
          </p>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <div className="space-y-6">
        {stores.map(([sellerId, storeItems]) => {
          const storeName = storeItems[0].storeName;
          const currency = storeItems[0].currency;
          const storeSubtotal = storeItems.reduce((s, i) => s + i.price * i.quantity, 0);
          const storeCleaning = storeItems.reduce(
            (s, i) => s + (i.cleaning ? i.cleaningCost * i.quantity : 0),
            0,
          );
          return (
            <div key={sellerId} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <h2 className="font-bold text-lg text-gray-900">{storeName}</h2>
                <span className="text-xs text-gray-400">{storeItems.length} article(s)</span>
              </div>
              <div className="space-y-3">
                {storeItems.map((item) => (
                  <div
                    key={`${item.listingId}-${item.cleaning}`}
                    className="flex items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title === 'New Listing' ? item.storeName : item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Fish className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {item.title === 'New Listing' ? item.storeName : item.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {item.currency} {item.price.toFixed(2)} / {item.unit}
                      </p>
                      {item.cleaningCost > 0 && (
                        <button
                          onClick={() => toggleCleaning(item.listingId, item.cleaning)}
                          className="flex items-center gap-1 mt-1"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${item.cleaning ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
                          >
                            {item.cleaning && <Check className="h-2 w-2 text-white" />}
                          </div>
                          <span
                            className={`text-xs ${item.cleaning ? 'text-green-600' : 'text-gray-400'}`}
                          >
                            {t('cart.cleaning')}: +{item.currency} {item.cleaningCost.toFixed(2)} /{' '}
                            {item.unit}
                          </span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <QuantityPicker
                        value={item.quantity}
                        max={9999}
                        onChange={(q) => updateQuantity(item.listingId, item.cleaning, q)}
                      />
                      <p className="font-semibold text-blue-600 w-20 text-right text-sm">
                        {(
                          item.price * item.quantity +
                          (item.cleaning ? item.cleaningCost * item.quantity : 0)
                        ).toFixed(2)}{' '}
                        {item.currency}
                      </p>
                      <button
                        onClick={() => removeItem(item.listingId, item.cleaning)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">
                <div className="flex items-center justify-between text-gray-500">
                  <span>{t('cart.subtotal')}</span>
                  <span>
                    {currency} {storeSubtotal.toFixed(2)}
                  </span>
                </div>
                {storeCleaning > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>{t('cart.cleaningFee')}</span>
                    <span>
                      {currency} {storeCleaning.toFixed(2)}
                    </span>
                  </div>
                )}
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

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center justify-between text-gray-500">
            <span>{t('cart.subtotal')}</span>
            <span>
              {items[0]?.currency || 'TND'} {total.toFixed(2)}
            </span>
          </div>
          {totalCleaning > 0 && (
            <div className="flex items-center justify-between text-green-600">
              <span>Total frais de nettoyage</span>
              <span>
                {items[0]?.currency || 'TND'} {totalCleaning.toFixed(2)}
              </span>
            </div>
          )}
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
          <div className="border-t pt-2 flex items-center justify-between text-lg">
            <span className="font-semibold">{t('cart.total')}</span>
            <span className="font-bold text-xl text-blue-600">
              {items[0]?.currency || 'TND'} {(total + totalDelivery).toFixed(2)}
            </span>
          </div>
        </div>
        <button
          onClick={handleConfirmOrder}
          disabled={submitting}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors text-lg"
        >
          {submitting ? 'Traitement en cours...' : 'Je confirme'}
        </button>
      </div>
    </div>
  );
}
