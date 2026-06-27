import { useEffect, useState } from 'react';

import { Button, Input } from '@fishmarket/ui';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { cloudinaryService, storesService } from '../../services';
import type { Store } from '../../types';
import { ImageUpload } from './image-upload';

const FISH_CATEGORIES = [
  'Sardine',
  'Sea Bream (Dorade)',
  'Sea Bass (Loup de Mer)',
  'Red Mullet (Rouget)',
  'Mackerel (Maquereau)',
  'Anchovy',
  'Grouper',
  'Tuna',
  'Bonito',
  'Horse Mackerel',
  'Octopus',
  'Squid',
  'Shrimp',
  'Crab',
  'Cuttlefish',
  'Mussels',
  'Clams',
  'Other',
];

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

interface UploadedImage {
  id: string;
  url: string;
  file: File;
  previewUrl: string;
}

export interface ListingFormSubmitData {
  category: string;
  description: string;
  price: number;
  quantity: number;
  condition: string;
  origin: string;
  storeId: string;
  imageIds?: string[];
  cloudinaryUrls?: string[];
  unit?: string;
  currency?: string;
}

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
  const [stores, setStores] = useState<Store[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('FRESH');
  const [origin, setOrigin] = useState('');
  const [storeId, setStoreId] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      storesService
        .getStores()
        .then(setStores)
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (editListing && open) {
      setCategory(editListing.product?.category?.name ?? editListing.title ?? '');
      setDescription(editListing.description ?? '');
      setPrice(String(editListing.price ?? ''));
      setQuantity(String(editListing.quantity ?? ''));
      setCondition(editListing.condition ?? 'FRESH');
      setOrigin(editListing.origin ?? '');
      setStoreId(editListing.storeId ?? '');

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
    } else if (open) {
      resetForm();
    }
  }, [editListing, open]);

  function resetForm() {
    setCategory('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setCondition('FRESH');
    setOrigin('');
    setStoreId('');
    setImages([]);
    setErrors({});
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!category) errs.category = 'Please select a fish category';
    if (!price || Number(price) <= 0) errs.price = 'Price must be greater than 0';
    if (!quantity || Number(quantity) <= 0) errs.quantity = 'Quantity must be greater than 0';
    if (!storeId) errs.storeId = 'Please select a store';
    if (images.length > 4) errs.images = 'Maximum 4 photos allowed';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    let cloudinaryUrls: string[] | undefined;

    if (images.length > 0) {
      setUploadingImages(true);
      try {
        const results = await Promise.all(images.map((img) => cloudinaryService.upload(img.file)));
        cloudinaryUrls = results.map((r) => r.url);
      } catch {
        setErrors({ images: 'Failed to upload images' });
        setUploadingImages(false);
        return;
      }
      setUploadingImages(false);
    }

    onSubmit({
      category,
      description,
      price: Number(price),
      quantity: Number(quantity),
      condition,
      origin,
      storeId,
      cloudinaryUrls,
    });
  }

  const isPendingOrUploading = isPending || uploadingImages;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[70vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editListing ? 'Edit Listing' : 'New Listing'}</DialogTitle>
          <DialogDescription>
            {editListing ? 'Update your fish listing' : 'Add your fish inventory for buyers'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Fish Information
              </h4>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Fish Category <span className="text-destructive">*</span>
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fish category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FISH_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Describe your fish, quality, catch details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Selling Price <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Select value="TND" defaultValue="TND">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TND">TND</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Available Quantity <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  <div className="w-28">
                    <Select defaultValue="Kg">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kg">Kg</SelectItem>
                        <SelectItem value="Piece">Piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Details & Origin
              </h4>

              <div className="space-y-2">
                <label className="text-sm font-medium">Condition</label>
                <Select value={condition} onValueChange={setCondition}>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Fishing Area / Origin</label>
                <Select value={origin} onValueChange={setOrigin}>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Store <span className="text-destructive">*</span>
                </label>
                <Select value={storeId} onValueChange={setStoreId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.storeId && <p className="text-xs text-destructive">{errors.storeId}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Photos (max 4)</label>
                <ImageUpload images={images} onChange={setImages} maxImages={4} />
                {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPendingOrUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPendingOrUploading}>
              {isPendingOrUploading
                ? uploadingImages
                  ? 'Uploading images...'
                  : 'Saving...'
                : editListing
                  ? 'Update Listing'
                  : 'Add Listing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
