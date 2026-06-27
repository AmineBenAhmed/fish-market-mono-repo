import { ImagePlus, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

import { filesService } from '../../services';

interface UploadedImage {
  id: string;
  url: string;
  file: File;
  previewUrl: string;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 4 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;

      const remaining = maxImages - images.length;
      const toUpload = Array.from(files).slice(0, remaining);

      setUploading(true);

      for (const file of toUpload) {
        const previewUrl = URL.createObjectURL(file);
        const uploaded = await filesService.upload(file);
        onChange([
          ...images,
          {
            id: uploaded.id,
            url: uploaded.url,
            file,
            previewUrl,
          },
        ]);
      }

      setUploading(false);
    },
    [images, maxImages, onChange],
  );

  const removeImage = useCallback(
    (index: number) => {
      const img = images[index];
      URL.revokeObjectURL(img.previewUrl);
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange],
  );

  const moveImage = useCallback(
    (from: number, to: number) => {
      const next = [...images];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onChange(next);
    },
    [images, onChange],
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="relative group aspect-square rounded-lg overflow-hidden border"
          >
            <img
              src={img.previewUrl}
              alt={`Upload ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(i, i - 1)}
                  className="text-white bg-white/20 hover:bg-white/30 rounded p-1 text-xs"
                >
                  ←
                </button>
              )}
              {i < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(i, i + 1)}
                  className="text-white bg-white/20 hover:bg-white/30 rounded p-1 text-xs"
                >
                  →
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="text-destructive bg-destructive/20 hover:bg-destructive/30 rounded p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                Cover
              </span>
            )}
          </div>
        ))}
        {images.length < maxImages && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
            {uploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <>
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
              className="sr-only"
              multiple
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} photos. First image is the cover.
      </p>
    </div>
  );
}
