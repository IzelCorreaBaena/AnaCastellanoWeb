import { http } from './http';
import type {
  Servicio,
  CreateServicioPayload,
  UpdateServicioPayload,
} from '@app-types/models';

export const servicesApi = {
  async list(): Promise<Servicio[]> {
    const { data } = await http.get<Servicio[]>('/services');
    return data;
  },

  async listAll(): Promise<Servicio[]> {
    const { data } = await http.get<Servicio[]>('/services?all=true');
    return data;
  },

  async get(id: string): Promise<Servicio> {
    const { data } = await http.get<Servicio>(`/services/${id}`);
    return data;
  },

  async create(payload: CreateServicioPayload): Promise<Servicio> {
    const { data } = await http.post<Servicio>('/services', payload);
    return data;
  },

  async update(id: string, payload: UpdateServicioPayload): Promise<Servicio> {
    const { data } = await http.put<Servicio>(`/services/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/services/${id}`);
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    // Do NOT set Content-Type manually — axios will add the correct
    // multipart boundary automatically when the body is a FormData instance.
    const { data } = await http.post<{ url: string }>('/uploads/image', formData);
    return data;
  },
};
