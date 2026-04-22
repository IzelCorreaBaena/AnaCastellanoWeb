import { http } from './http';
import type {
  Curso,
  CreateCursoPayload,
  UpdateCursoPayload,
} from '@app-types/models';

export const cursosApi = {
  async list(): Promise<Curso[]> {
    const { data } = await http.get<Curso[]>('/cursos');
    return data;
  },

  async listAll(): Promise<Curso[]> {
    const { data } = await http.get<Curso[]>('/cursos?all=true');
    return data;
  },

  async get(id: string): Promise<Curso> {
    const { data } = await http.get<Curso>(`/cursos/${id}`);
    return data;
  },

  async create(payload: CreateCursoPayload): Promise<Curso> {
    const { data } = await http.post<Curso>('/cursos', payload);
    return data;
  },

  async update(id: string, payload: UpdateCursoPayload): Promise<Curso> {
    const { data } = await http.put<Curso>(`/cursos/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/cursos/${id}`);
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
