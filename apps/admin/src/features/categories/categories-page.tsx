import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Fish, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '../../components/shared/page-header';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { categoriesService, cloudinaryService } from '../../services';
import type { Category } from '../../stores/catalog';
import { useCatalogStore } from '../../stores/catalog';

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const loadCategories = useCatalogStore((s) => s.loadCategories);
  const [selected, setSelected] = useState<Category | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [editName, setEditName] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  const [addName, setAddName] = useState('');
  const [addSlug, setAddSlug] = useState('');
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addPreview, setAddPreview] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  });

  const categories = data ?? [];

  function resetEdit() {
    setEditName('');
    setEditFile(null);
    setEditPreview(null);
  }

  function openEdit(cat: Category) {
    setSelected(cat);
    setEditName(cat.name);
    setEditFile(null);
    setEditPreview(null);
  }

  function resetAdd() {
    setAddName('');
    setAddSlug('');
    setAddFile(null);
    setAddPreview(null);
  }

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof categoriesService.update>[1];
    }) => categoriesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      loadCategories();
      setSelected(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string; imageUrl?: string }) =>
      categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      loadCategories();
      setShowAdd(false);
      resetAdd();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      loadCategories();
      setSelected(null);
    },
  });

  async function handleEditSave() {
    if (!selected || !editName.trim()) return;

    let imageUrl: string | undefined;

    if (editFile) {
      setUploading(true);
      try {
        const uploaded = await cloudinaryService.upload(editFile);
        imageUrl = uploaded.url;
      } catch {
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    updateMutation.mutate({
      id: selected.id,
      data: {
        name: editName.trim(),
        slug: selected.slug,
        ...(imageUrl && { imageUrl }),
      },
    });
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim() || !addSlug.trim()) return;

    let imageUrl: string | undefined;

    if (addFile) {
      setUploading(true);
      try {
        const uploaded = await cloudinaryService.upload(addFile);
        imageUrl = uploaded.url;
      } catch {
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    createMutation.mutate({ name: addName.trim(), slug: addSlug.trim(), imageUrl });
  }

  const isPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || uploading;

  return (
    <div className="space-y-6">
      <PageHeader title="Fish Categories" description="Manage fish categories">
        <Button
          onClick={() => {
            resetAdd();
            setShowAdd(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </PageHeader>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Fish className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No categories yet</p>
          <p className="text-sm">Add your first fish category to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => openEdit(cat)}
              className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all text-left"
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {cat.image?.url ? (
                  <img
                    src={cat.image.url}
                    alt={cat.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Fish className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Pencil className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-sm truncate">{cat.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">/{cat.slug}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(o) => {
          if (!o) {
            setSelected(null);
            resetEdit();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              {editPreview ? (
                <div className="relative">
                  <img
                    src={editPreview}
                    alt=""
                    className="h-32 w-32 rounded-xl object-cover border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditFile(null);
                      setEditPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-muted-foreground text-background rounded-full h-6 w-6 flex items-center justify-center hover:bg-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : selected?.image?.url ? (
                <div className="relative">
                  <img
                    src={selected.image.url}
                    alt=""
                    className="h-32 w-32 rounded-xl object-cover border"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 rounded-xl cursor-pointer transition-colors">
                    <ImagePlus className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setEditFile(f);
                          setEditPreview(URL.createObjectURL(f));
                        }
                      }}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
                  <ImagePlus className="h-8 w-8 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add photo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setEditFile(f);
                        setEditPreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Category name"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => selected && deleteMutation.mutate(selected.id)}
                disabled={isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelected(null);
                  resetEdit();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleEditSave}
                disabled={isPending || !editName.trim()}
              >
                {uploading ? 'Uploading...' : 'Save'}
              </Button>
            </div>

            {deleteMutation.isError && (
              <p className="text-xs text-destructive text-center">
                {(deleteMutation.error as Error).message}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAdd}
        onOpenChange={(o) => {
          if (!o) {
            setShowAdd(false);
            resetAdd();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. White Fish"
                value={addName}
                onChange={(e) => {
                  setAddName(e.target.value);
                  if (
                    !addSlug ||
                    addSlug ===
                      addName
                        .trim()
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '')
                  ) {
                    setAddSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, ''),
                    );
                  }
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Slug <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="white-fish"
                value={addSlug}
                onChange={(e) =>
                  setAddSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Photo</label>
              {addPreview ? (
                <div className="relative inline-block">
                  <img
                    src={addPreview}
                    alt=""
                    className="h-28 w-28 rounded-xl object-cover border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAddFile(null);
                      setAddPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-muted-foreground text-background rounded-full h-6 w-6 flex items-center justify-center hover:bg-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer hover:bg-accent text-sm transition-colors">
                  <ImagePlus className="h-4 w-4" />
                  Choose image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setAddFile(f);
                        setAddPreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAdd(false);
                  resetAdd();
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !addName.trim() || !addSlug.trim()}>
                {isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
