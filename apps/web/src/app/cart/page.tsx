'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { QuantityPicker } from '@/components/quantity-picker';
import { CheckoutModal } from '@/components/checkout-modal';
import { createOrder } from '@/lib/api';
import { ShoppingCart, Trash2, ArrowLeft, Fish, Loader2 } from 'lucide-react';

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCheckout = async (data: { name: string; phone: string; address: string }) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        customerName: data.name,
        customerPhone: data.phone,
        customerAddress: data.address,
        items: items.map((i) => ({ listingId: i.listingId, quantity: i.quantity })),
      };
      await createOrder(payload);
      clearCart();
      setSuccess(true);
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-20">
        <div className="bg-green-100 text-green-700 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Fish className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-500 mb-6">Thank you for your order. We will contact you soon.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add some fish from the market</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Browse Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <span className="text-gray-500">{itemCount} items</span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.listingId}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Fish className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.storeName}</p>
              <p className="text-sm text-gray-400">
                {item.currency} {item.price.toFixed(2)} / {item.unit}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <QuantityPicker
                value={item.quantity}
                max={item.maxQuantity}
                onChange={(q) => updateQuantity(item.listingId, q)}
              />
              <p className="font-semibold text-blue-600 w-20 text-right">
                {(item.price * item.quantity).toFixed(2)} {item.currency}
              </p>
              <button
                onClick={() => removeItem(item.listingId)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between text-lg mb-4">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-xl text-blue-600">
            {items[0]?.currency || 'TND'} {total.toFixed(2)}
          </span>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-lg"
        >
          Proceed to Checkout
        </button>
      </div>

      <CheckoutModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setError(null);
        }}
        onSubmit={handleCheckout}
        error={error}
        loading={submitting}
      />
    </div>
  );
}
