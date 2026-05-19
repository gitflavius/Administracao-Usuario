export type TipoTelefone = 'celular' | 'residencial' | 'comercial';

export interface User {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipoTelefone: TipoTelefone;
}

export type UserFormData = Omit<User, 'id'>;

export interface UserPage {
  users: User[];
  total: number;
}
