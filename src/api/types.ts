export type Cargo = "OPERADOR" | "GERENTE" | "ADMIN";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: Cargo;
  createdAt: string;
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

export interface CriarUsuarioInput {
  nome: string;
  email: string;
  senha?: string;
  cargo: Cargo;
}

export interface Loja {
  id: string;
  nome: string;
  localizacao: string;
  token: string;
  gerenteId?: string;
  createdAt: string;
}

export interface Marca {
  id: string;
  nome: string;
}

export interface MixProdutoItem {
  id: string;
  mixProdutoId: string;
  nomeProduto: string;
  produtoId: string;
}

export interface MixProduto {
  id: string;
  nome: string;
  marcaId: string;
  marca?: Marca;
  criadorId: string;
  criador?: Partial<Usuario>;
  itens: MixProdutoItem[];
  _count?: {
    itens: number;
  };
  createdAt: string;
}

export interface CriarMixInput {
  nome: string;
  marcaId: string;
  itens: {
    produtoId: string;
  }[];
}

export interface AtribuirMixLojaInput {
  lojaId: string;
  mixId: string;
}

export interface ItemMixEstoque {
  id: string;
  produtoId: string;
  estoqueAtual: number;
  estoqueDesejado: number;
  ultimaAtualizacao: string;
}