import { http } from './http';
import type { Bloque, CreateBloquePayload, UpdateBloquePayload } from '@app-types/models';

export const blocksApi = {
  async create(payload: CreateBloquePayload): Promise<Bloque> {
    const { data } = await http.post<Bloque>('/blocks', payload);
    return data;
  },

  async update(id: string, payload: UpdateBloquePayload): Promise<Bloque> {
    const { data } = await http.put<Bloque>(`/blocks/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/blocks/${id}`);
  },
};
