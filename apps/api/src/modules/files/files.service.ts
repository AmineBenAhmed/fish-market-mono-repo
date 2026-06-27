import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(userId: string, file: Express.Multer.File) {
    const record = await this.prisma.file.create({
      data: {
        userId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${file.filename}`,
      },
    });

    return record;
  }

  async delete(fileId: string): Promise<void> {
    await this.prisma.file.delete({ where: { id: fileId } });
  }
}
