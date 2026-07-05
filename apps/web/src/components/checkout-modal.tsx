'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useLocale } from '@/lib/i18n/context';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string; address: string }) => void;
  error: string | null;
  loading: boolean;
}

export function CheckoutModal({ open, onClose, onSubmit, error, loading }: Props) {
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'name' | 'phone' | 'address', string>>
  >({});

  if (!open) return null;

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!name.trim()) errs.name = t('checkout.nameRequired');
    if (!phone.trim()) errs.phone = t('checkout.phoneRequired');
    else if (!/^[\d\s+\-()]{7,20}$/.test(phone.trim())) errs.phone = t('checkout.phoneInvalid');
    if (!address.trim()) errs.address = t('checkout.addressRequired');
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), phone: phone.trim(), address: address.trim() });
  };

  const handleClose = () => {
    setFieldErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('checkout.fullAddress')}
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('checkout.addressPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
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
