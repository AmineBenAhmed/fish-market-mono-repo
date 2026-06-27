import { Button, Input } from '@fishmarket/ui';
import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { catalogService } from '../../services';
import type { Category, Product } from '../../types';
import { ImageUpload } from './image-upload';

const CONDITIONS = ['FRESH', 'FROZEN', 'CHILLED'] as const;
const ORIGINS = [
  'Sfax',
  'Mahdia',
  'Gabès',
  'Monastir',
  'Bizerte',
  'Tunis',
  'Hammamet',
  'Nabeul',
  'Zarzis',
  'Kélibia',
  'La Goulette',
  'Chebba',
  'Kerkennah',
];
const UNITS = ['Kg', 'Box', 'Crate', 'Piece', 'Dozens'];

interface UploadedImage {
  id: string;
  url: string;
  file: File;
  previewUrl: string;
}

interface ListingFormData {
  categoryId: string;
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  unit: string;
  quantity: string;
  averageWeight: string;
  size: string;
  condition: string;
  catchDate: string;
  availabilityDate: string;
  origin: string;
  notes: string;
}

export type ListingFormSubmitData = {
  productId: string;
  price: number;
  quantity: number;
  unit?: string;
  title?: string;
  description?: string;
  catchDate?: string;
  availabilityDate?: string;
  origin?: string;
  condition?: string;
  averageWeight?: number;
  currency?: string;
  notes?: string;
  imageIds?: string[];
};

interface ListingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ListingFormSubmitData) => void;
  isPending: boolean;
  editListing?: any;
}

export function ListingFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  editListing,
}: ListingFormDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [form, setForm] = useState<ListingFormData>({
    categoryId: '',
    productId: '',
    title: '',
    description: '',
    price: '',
    currency: 'TND',
    unit: 'Kg',
    quantity: '',
    averageWeight: '',
    size: '',
    condition: 'FRESH',
    catchDate: '',
    availabilityDate: new Date().toISOString().split('T')[0],
    origin: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({});

  useEffect(() => {
    catalogService
      .getCategories()
      .then(setCategories)
      .catch(() => {});
    catalogService
      .getProducts()
      .then(setProducts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (form.categoryId) {
      setFilteredProducts(products.filter((p) => p.category?.id === form.categoryId));
      setForm((prev) => ({ ...prev, productId: '' }));
    } else {
      setFilteredProducts(products);
    }
  }, [form.categoryId, products]);

  useEffect(() => {
    if (editListing) {
      const product = editListing.product;
      setForm({
        categoryId: product?.category?.id ?? '',
        productId: editListing.productId ?? '',
        title: editListing.title ?? '',
        description: editListing.description ?? '',
        price: String(editListing.price ?? ''),
        currency: editListing.currency ?? 'TND',
        unit: editListing.unit ?? 'Kg',
        quantity: String(editListing.quantity ?? ''),
        averageWeight: editListing.averageWeight ? String(editListing.averageWeight) : '',
        size: '',
        condition: editListing.condition ?? 'FRESH',
        catchDate: editListing.catchDate ? editListing.catchDate.split('T')[0] : '',
        availabilityDate: editListing.availabilityDate
          ? editListing.availabilityDate.split('T')[0]
          : new Date().toISOString().split('T')[0],
        origin: editListing.origin ?? '',
        notes: editListing.notes ?? '',
      });

      if (editListing.images?.length) {
        setImages(
          editListing.images.map((img: any) => ({
            id: img.file?.id ?? img.fileId,
            url: img.file?.url ?? '',
            file: new File([], img.file?.originalName ?? 'image'),
            previewUrl: img.file?.url ?? '',
          })),
        );
      }
    } else {
      resetForm();
    }
  }, [editListing, open]);

  function resetForm() {
    setForm({
      categoryId: '',
      productId: '',
      title: '',
      description: '',
      price: '',
      currency: 'TND',
      unit: 'Kg',
      quantity: '',
      averageWeight: '',
      size: '',
      condition: 'FRESH',
      catchDate: '',
      availabilityDate: new Date().toISOString().split('T')[0],
      origin: '',
      notes: '',
    });
    setImages([]);
    setErrors({});
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof ListingFormData, string>> = {};

    if (!form.productId) errs.productId = 'Please select a fish product';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Price must be greater than 0';
    if (!form.quantity || Number(form.quantity) <= 0)
      errs.quantity = 'Quantity must be greater than 0';
    if (images.length > 4) errs.notes = 'Maximum 4 photos allowed';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      productId: form.productId,
      price: Number(form.price),
      quantity: Number(form.quantity),
      unit: form.unit,
      title: form.title || undefined,
      description: form.description || undefined,
      catchDate: form.catchDate || undefined,
      availabilityDate: form.availabilityDate || undefined,
      origin: form.origin || undefined,
      condition: form.condition || undefined,
      averageWeight: form.averageWeight ? Number(form.averageWeight) : undefined,
      currency: form.currency || undefined,
      notes: form.notes || undefined,
      imageIds: images.map((img) => img.id),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editListing ? 'Edit Listing' : 'New Listing'}</DialogTitle>
          <DialogDescription>
            {editListing
              ? 'Update your daily fish listing details'
              : "Add today's fish inventory for your buyers"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Fish Category
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, categoryId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories ?? []).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Fish Type <span className="text-destructive">*</span>
                </label>
                <Select
                  value={form.productId}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, productId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fish" />
                  </SelectTrigger>
                  <SelectContent>
                    {(filteredProducts ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && <p className="text-xs text-destructive">{errors.productId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Listing Title</label>
                <Input
                  placeholder="e.g. Fresh Sea Bream"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="e.g. Wild caught, premium quality"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Pricing & Quantity
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Selling Price <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, currency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TND">TND</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price Unit</label>
                <Select
                  value={form.unit}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, unit: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        per {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Available Quantity <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={form.quantity}
                  onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                />
                {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity Unit</label>
                <Select
                  value={form.unit}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, unit: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Product Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Average Weight</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 1.5"
                  value={form.averageWeight}
                  onChange={(e) => setForm((prev) => ({ ...prev, averageWeight: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <Select
                  value={form.condition}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, condition: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0) + c.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Freshness & Origin
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Catch Date</label>
                <Input
                  type="date"
                  value={form.catchDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, catchDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Availability Date</label>
                <Input
                  type="date"
                  value={form.availabilityDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, availabilityDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fishing Area / Origin</label>
              <Select
                value={form.origin}
                onValueChange={(v) => setForm((prev) => ({ ...prev, origin: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  {ORIGINS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Photos
            </h4>
            <ImageUpload images={images} onChange={setImages} maxImages={4} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes for Buyers</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. Fresh catch from this morning"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : editListing ? 'Update Listing' : 'Add Listing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
