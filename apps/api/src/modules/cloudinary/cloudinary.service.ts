import { Inject, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof cloudinary) {}

  async uploadFile(
    filePath: string,
    options?: { folder?: string; publicId?: string },
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader.upload(
        filePath,
        {
          folder: options?.folder ?? 'fishmarket/listings',
          public_id: options?.publicId,
          resource_type: 'image',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) reject(error);
          else resolve(result!);
        },
      );
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await this.cloudinary.uploader.destroy(publicId);
  }
}
