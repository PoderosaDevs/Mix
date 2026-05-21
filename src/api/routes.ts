import { api } from './index';
import * as T from "./types";

export const apiService = {
  auth: {
    login: (dados: Pick<T.CriarUsuarioInput, "email" | "senha">) =>
      api.post<T.AuthResponse>("/auth/login", dados),
  },

  usuarios: {
    listar: () => api.get<T.Usuario[]>("/users"),
    buscarPorId: (id: string) => api.get<T.Usuario>(`/users/${id}`),
    criar: (dados: T.CriarUsuarioInput) => api.post<T.Usuario>("/users", dados),
    atualizar: (id: string, dados: Partial<T.CriarUsuarioInput>) =>
      api.put<T.Usuario>(`/users/${id}`, dados),
    deletar: (id: string) => api.delete(`/users/${id}`),
  },

  lojas: {
    listar: () => api.get<T.Loja[]>("/stores"),

    criar: (dados: Omit<T.Loja, "id" | "token" | "createdAt">) =>
      api.post<T.Loja>("/stores", dados),

    atualizar: (id: string, dados: Partial<Omit<T.Loja, "id" | "token" | "createdAt">>) =>
      api.put<T.Loja>(`/stores/${id}`, dados),

    deletar: (id: string) => api.delete(`/stores/${id}`),
  },

  marcas: {
    listar: () => api.get<T.Marca[]>("/brands"),
    buscarPorId: (id: string) => api.get<T.Marca>(`/brands/${id}`),
    criar: (dados: Omit<T.Marca, "id">) => api.post<T.Marca>("/brands", dados),
    atualizar: (id: string, dados: Partial<Omit<T.Marca, "id">>) =>
      api.put<T.Marca>(`/brands/${id}`, dados),
    deletar: (id: string) => api.delete(`/brands/${id}`),
  },

  // produtos: {
  //   listar: () => api.get<T.Produto[]>("/products"),
  //   buscarPorId: (id: string) => api.get<T.Produto>(`/products/${id}`),
  //   criar: (dados: T.CriarProdutoInput) => api.post<T.Produto>("/products", dados),
  //   atualizar: (id: string, dados: Partial<T.CriarProdutoInput>) => 
  //     api.put<T.Produto>(`/products/${id}`, dados),
  //   deletar: (id: string) => api.delete(`/products/${id}`),
  // },

 mixProdutos: {
  listarTodos: () =>
    api.get<T.MixProduto[]>("/mixes"),

  listarPorLoja: (lojaId: string) =>
    api.get<T.MixProduto[]>(`/stores/mixes/${lojaId}`),

  buscarPorId: (id: string) =>
    api.get<T.MixProduto>(`/mixes/${id}`),

  criar: (dados: T.CriarMixInput) =>
    api.post<T.MixProduto>("/mixes", dados),

  atualizar: (id: string, dados: Partial<T.CriarMixInput>) =>
    api.put<T.MixProduto>(`/mixes/${id}`, dados),

  excluir: (id: string) =>
    api.delete(`/mixes/${id}`),

  atribuir: (dados: { lojaId: string; mixIds: string[]; gerenteId?: string | null }) =>
    api.post("/mixes/atribuir", dados),

  atribuirALoja: (dados: T.AtribuirMixLojaInput) =>
    api.post("/mixes/atribuir", dados),

  atualizarEstoqueLoja: (atribuicaoId: string, itens: any[]) =>
    api.patch(`/mixes/estoque/${atribuicaoId}`, { itens })
}
};