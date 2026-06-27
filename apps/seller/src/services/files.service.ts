import { api } from './api';

export const filesService = {
  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data.data as {
      id: string;
      url: string;
      originalName: string;
      mimeType: string;
      size: number;
    };
  },
};
