import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Fish, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ImageUpload } from '../../components/shared/image-upload';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  cloudinaryService,
  listingsService,
  productsService,
  sellersService,
} from '../../services';
import { useCatalogStore } from '../../stores/catalog';
import type { SellerProfile } from '../../types';

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

export function ListingCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { categories, loaded, loadCategories } = useCatalogStore();

  const [stores, setStores] = useState<SellerProfile[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [storeId, setStoreId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('FRESH');
  const [origin, setOrigin] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
    sellersService.getSellers({ limit: 100 }).then((res) => {
      setStores(res.data);
    });
  }, [loadCategories]);

  const { data: categoryProducts } = useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: () => productsService.getByCategory(categoryId),
    enabled: !!categoryId,
  });

  const products = categoryProducts ?? [];

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof listingsService.create>[0]) =>
      listingsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      navigate('/listings');
    },
  });

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!storeId) errs.store = 'Please select a store';
    if (!categoryId) errs.category = 'Please select a category';
    if (!price || Number(price) <= 0) errs.price = 'Price must be greater than 0';
    if (!quantity || Number(quantity) <= 0) errs.quantity = 'Quantity must be greater than 0';
    if (images.length > 4) errs.images = 'Maximum 4 photos allowed';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const firstProduct = products[0];
    if (!firstProduct) {
      setErrors({ category: 'No products available for this category' });
      return;
    }

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

    createMutation.mutate({
      sellerId: storeId,
      productId: firstProduct.id,
      date: new Date().toISOString(),
      price: Number(price),
      quantity: Number(quantity),
      title: firstProduct.name,
      description: description || undefined,
      condition,
      origin: origin || undefined,
      unit: 'Kg',
      currency: 'TND',
      cloudinaryUrls,
    });
  }

  const isPendingOrUploading = createMutation.isPending || uploadingImages;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create Listing</h1>
          <p className="text-sm text-muted-foreground">Add a new listing for any store</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/listings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Store & Fish Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Store <span className="text-destructive">*</span>
              </label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        {s.storeName}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.store && <p className="text-xs text-destructive">{errors.store}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Fish Category <span className="text-destructive">*</span>
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={!loaded ? 'Loading...' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        {cat.image?.url ? (
                          <img
                            src={cat.image.url}
                            alt=""
                            className="h-4 w-4 rounded object-cover"
                          />
                        ) : (
                          <Fish className="h-4 w-4 text-muted-foreground" />
                        )}
                        {cat.name}
                      </span>
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
                placeholder="Describe the fish, quality, catch details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details & Origin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <label className="text-sm font-medium">Photos (max 4)</label>
              <ImageUpload images={images} onChange={setImages} maxImages={4} />
              {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/listings')}
            disabled={isPendingOrUploading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPendingOrUploading}>
            {isPendingOrUploading
              ? uploadingImages
                ? 'Uploading images...'
                : 'Saving...'
              : 'Add Listing'}
          </Button>
        </div>

        {createMutation.isError && (
          <p className="text-destructive text-sm text-right">
            Failed to create listing: {(createMutation.error as Error).message}
          </p>
        )}
      </form>
    </div>
  );
}
