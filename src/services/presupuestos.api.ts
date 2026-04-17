import { http } from './http';
import type { Presupuesto, PresupuestoListItem } from '@app-types/models';

export interface PresupuestoItemInput {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface CreatePresupuestoInput {
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  items: PresupuestoItemInput[];
  igicPorcentaje?: number;
  notas?: string;
}

export const presupuestosApi = {
  list: (): Promise<PresupuestoListItem[]> =>
    http.get<PresupuestoListItem[]>('/presupuestos').then((r) => r.data),

  create: (data: CreatePresupuestoInput): Promise<Presupuesto> =>
    http.post<Presupuesto>('/presupuestos', data).then((r) => r.data),

  downloadPdf: async (id: string, numero: number): Promise<void> => {
    const response = await http.get<Blob>(`/presupuestos/${id}/pdf`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presupuesto-${numero}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
