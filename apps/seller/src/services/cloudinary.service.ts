import { api } from './api';

export const cloudinaryService = {
  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/cloudinary/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.data as { url: string; publicId: string; originalName: string };
  },
};
