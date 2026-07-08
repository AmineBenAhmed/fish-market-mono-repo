'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useLocale } from '@/lib/i18n/context';
import { AddressForm } from './address-form';
import type { AddressFormValue } from './address-form';

interface CheckoutData {
  name: string;
  phone: string;
  address: string;
  governorateId?: string;
  areaId?: string;
  zoneId?: string;
  street?: string;
  buildingNumber?: string;
  apartment?: string;
  floor?: string;
  landmark?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CheckoutData) => void;
  error: string | null;
  loading: boolean;
}

export function CheckoutModal({ open, onClose, onSubmit, error, loading }: Props) {
  const { t } = useLocale();
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
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'name' | 'phone' | 'address', string>>
  >({});

  if (!open) return null;

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!name.trim()) errs.name = t('checkout.nameRequired');
    if (!phone.trim()) errs.phone = t('checkout.phoneRequired');
    else if (!/^[\d\s+\-()]{7,20}$/.test(phone.trim())) errs.phone = t('checkout.phoneInvalid');
    if (!addressForm.street.trim() || !addressForm.areaId || !addressForm.zoneId) {
      errs.address = t('checkout.addressRequired');
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parts: string[] = [];
    if (addressForm.street) parts.push(addressForm.street);
    if (addressForm.buildingNumber) parts.push(`بناية ${addressForm.buildingNumber}`);
    if (addressForm.floor) parts.push(`طابق ${addressForm.floor}`);
    if (addressForm.apartment) parts.push(`شقة ${addressForm.apartment}`);
    if (addressForm.landmark) parts.push(`بجانب ${addressForm.landmark}`);

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      address: parts.join('، ') || addressForm.street,
      ...addressForm,
    });
  };

  const handleClose = () => {
    setFieldErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">{t('checkout.confirmOrder')}</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('checkout.fullName')}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('checkout.fullNamePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('checkout.phoneNumber')}
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('checkout.phonePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('checkout.fullAddress')}
            </label>
            <AddressForm value={addressForm} onChange={setAddressForm} showLabel={false} />
            {fieldErrors.address && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? t('checkout.processing') : t('checkout.placeOrder')}
          </button>
        </form>
      </div>
    </div>
  );
}
