import { api } from './api';

interface UploadedFile {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export const filesService = {
  async upload(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.data as UploadedFile;
  },
};
