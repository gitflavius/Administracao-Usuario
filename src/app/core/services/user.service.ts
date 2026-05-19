import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, UserFormData, UserPage } from '../models/user.model';

const STORAGE_KEY = 'user_manager_users';

// Dados iniciais — usados apenas na primeira vez (localStorage vazio)
const SEED_USERS: User[] = [
  { id: '1', nome: 'Ana Silva', email: 'ana@email.com', cpf: '529.982.247-25', telefone: '(11) 99999-0001', tipoTelefone: 'celular' },
  { id: '2', nome: 'Bruno Costa', email: 'bruno@email.com', cpf: '111.444.777-35', telefone: '(11) 98888-0002', tipoTelefone: 'celular' },
  { id: '3', nome: 'Carla Mendes', email: 'carla@email.com', cpf: '222.555.888-30', telefone: '(21) 3333-0003', tipoTelefone: 'residencial' },
  { id: '4', nome: 'Daniel Rocha', email: 'daniel@email.com', cpf: '333.666.999-45', telefone: '(31) 97777-0004', tipoTelefone: 'celular' },
  { id: '5', nome: 'Elena Santos', email: 'elena@email.com', cpf: '444.777.111-50', telefone: '(41) 96666-0005', tipoTelefone: 'comercial' },
  { id: '6', nome: 'Felipe Lima', email: 'felipe@email.com', cpf: '555.888.222-60', telefone: '(51) 95555-0006', tipoTelefone: 'celular' },
  { id: '7', nome: 'Giana Sandrini', email: 'giana@attomatus.com.br', cpf: '666.999.333-70', telefone: '(11) 94444-0007', tipoTelefone: 'celular' },
  { id: '8', nome: 'Henrique Alves', email: 'henrique@email.com', cpf: '777.111.444-80', telefone: '(21) 93333-0008', tipoTelefone: 'residencial' },
  { id: '9', nome: 'Isabela Nunes', email: 'isabela@email.com', cpf: '888.222.555-90', telefone: '(31) 92222-0009', tipoTelefone: 'celular' },
  { id: '10', nome: 'João Ferreira', email: 'joao@email.com', cpf: '999.333.666-00', telefone: '(41) 91111-0010', tipoTelefone: 'comercial' },
  { id: '11', nome: 'Karen Oliveira', email: 'karen@email.com', cpf: '123.456.789-09', telefone: '(11) 90000-0011', tipoTelefone: 'celular' },
  { id: '12', nome: 'Lucas Martins', email: 'lucas@email.com', cpf: '987.654.321-00', telefone: '(21) 89999-0012', tipoTelefone: 'celular' },
];

@Injectable({ providedIn: 'root' })
export class UserService {

  // ── Persistência ─────────────────────────────────────────────────────────

  private load(): User[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as User[];
      // Primeira vez: semeia o localStorage com os dados iniciais
      this.save(SEED_USERS);
      return [...SEED_USERS];
    } catch {
      return [...SEED_USERS];
    }
  }

  private save(users: User[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  // ── Métodos públicos ──────────────────────────────────────────────────────

  /**
   * Busca + paginação em memória.
   * throwError → permite que o effect use catchError de forma real.
   */
  fetch(params: { query: string; page: number; pageSize: number }): Observable<UserPage> {
    try {
      const all = this.load();
      const q = params.query.trim().toLowerCase();
      const filtered = q ? all.filter(u => u.nome.toLowerCase().includes(q)) : all;
      const start = params.page * params.pageSize;
      const users = filtered.slice(start, start + params.pageSize);
      return of({ users, total: filtered.length }).pipe(delay(300));
    } catch {
      return throwError(() => new Error('Erro ao carregar usuários.'));
    }
  }

  create(data: UserFormData): Observable<User> {
    try {
      const all = this.load();
      const newUser: User = { id: `u_${Date.now()}`, ...data };
      this.save([newUser, ...all]);          // persiste imediatamente
      return of(newUser).pipe(delay(300));
    } catch {
      return throwError(() => new Error('Erro ao criar usuário.'));
    }
  }

  update(id: string, data: UserFormData): Observable<User> {
    try {
      const all = this.load();
      const updated: User = { id, ...data };
      this.save(all.map(u => u.id === id ? updated : u));  // persiste imediatamente
      return of(updated).pipe(delay(300));
    } catch {
      return throwError(() => new Error('Erro ao atualizar usuário.'));
    }
  }
}
