import { http } from './http';
import type { Mensaje } from '@app-types/models';

export interface SendContactoPayload {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
}

export const contactoApi = {
  send: (data: SendContactoPayload) =>
    http.post<{ success: boolean }>('/contacto', data).then((r) => r.data),

  list: () =>
    http.get<Mensaje[]>('/contacto').then((r) => r.data),

  markRead: (id: string) =>
    http.put<{ success: boolean }>(`/contacto/${id}/read`, {}).then((r) => r.data),
};
