# Administração de Usuários — Angular 17+

Aplicação de gerenciamento de usuários desenvolvida como desafio técnico para a Attus.

## Stack

- **Angular 17+** — Standalone Components, OnPush, `@for` / `@if`
- **Angular Material** — UI components (List, Dialog, Paginator, Toolbar)
- **NgRx** — Store, Effects, Selectors, Actions
- **RxJS** — `switchMap`, `debounceTime`, `distinctUntilChanged`, `catchError`, `withLatestFrom`
- **Jest** + **jest-preset-angular** — testes unitários com cobertura > 60%
- **localStorage** — persistência dos dados entre sessões

## Pré-requisitos

- Node.js 18+
- npm 9+

## Instalação

```bash
npm install
```

## Executar localmente

```bash
npm start
# Acesse http://localhost:4200
```

## Testes

```bash
npm test                # executa todos os testes
npm run test:coverage   # com relatório de cobertura
```

## Funcionalidades

- Listagem de usuários com nome, e-mail e botão de editar
- Filtro por nome com debounce de 300 ms (server-side no effect)
- Paginação da listagem
- Estado de loading e mensagem de erro em caso de falha
- Modal de criação via botão FAB vermelho
- Modal de edição com formulário pré-preenchido automaticamente
- Validações: e-mail, CPF (algoritmo dígitos verificadores) e telefone
- Botão Salvar desabilitado enquanto o formulário estiver inválido
- Persistência via localStorage — dados mantidos após recarregar a página

## Estrutura do projeto

## Estrutura do projeto

```
src/app/
├── core/
│   ├── models/user.model.ts
│   └── services/user.service.ts
├── store/users/
│   ├── user.actions.ts
│   ├── user.reducer.ts + spec
│   ├── user.selectors.ts + spec
│   └── user.effects.ts
├── features/users/
│   ├── user-list/ + spec
│   ├── user-card/
│   └── user-form/ + spec
├── app.config.ts
├── app.routes.ts
└── app.component.ts
```
