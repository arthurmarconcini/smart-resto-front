---
name: conventional-commits
description: |
  Padronização de mensagens de commit seguindo Conventional Commits.
  Aplique SEMPRE ao criar mensagens de commit, incluindo tipos, escopos
  e formato obrigatório para o projeto SmartResto.
---

# Conventional Commits — SmartResto

Todas as mensagens de commit do projeto **SmartResto** devem seguir a especificação [Conventional Commits](https://www.conventionalcommits.org/pt-br/). As mensagens devem ser escritas em **Inglês (en-US)**.

---

## Formato Obrigatório

```
<tipo>(<escopo>): <descrição imperativa>

[corpo opcional]

[rodapé opcional]
```

### Regras da Linha Principal

| Regra              | Descrição                                 |
| ------------------ | ----------------------------------------- |
| **Idioma**         | Inglês (en-US)                            |
| **Verbo**          | Imperativo (ex: "add", "fix", "remove")   |
| **Letra inicial**  | minúscula                                 |
| **Ponto final**    | ❌ Não usar                               |
| **Tamanho máximo** | 72 caracteres (tipo + escopo + descrição) |
| **Escopo**         | Obrigatório sempre que possível           |

---

## Tipos Permitidos

| Tipo       | Emoji | Quando usar                            | Exemplo                                          |
| ---------- | ----- | -------------------------------------- | ------------------------------------------------ |
| `feat`     | ✨    | Nova funcionalidade para o usuário     | `feat(sales): add period filter`                 |
| `fix`      | 🐛    | Correção de bug                        | `fix(finance): fix overdue expenses calculation` |
| `refactor` | ♻️    | Refatoração sem alterar comportamento  | `refactor(hooks): extract debounce logic`        |
| `style`    | 💄    | Mudanças visuais/CSS (não lógica)      | `style(dashboard): adjust KPI card spacing`      |
| `docs`     | 📝    | Documentação                           | `docs(skills): update audit standards`           |
| `test`     | ✅    | Testes                                 | `test(products): add product form tests`         |
| `chore`    | 🔧    | Manutenção, configs, deps              | `chore(deps): bump lucide-react to v0.300`       |
| `perf`     | ⚡    | Otimização de performance              | `perf(sales): memoize totals calculation`        |
| `ci`       | 👷    | CI/CD pipelines                        | `ci: add deploy workflow`                        |
| `build`    | 📦    | Sistema de build, dependências globais | `build: configure path aliases in vite`          |

---

## Escopos do Projeto SmartResto

Use os escopos abaixo para categorizar a área afetada:

| Escopo       | Diretório / Área                                         |
| ------------ | -------------------------------------------------------- |
| `auth`       | `pages/auth/` — Login, Register, Forgot Password         |
| `dashboard`  | `pages/app/Dashboard` — Dashboard principal e KPIs       |
| `sales`      | `pages/sales/` — Vendas, PDV, Anota Aí                   |
| `finance`    | `pages/finance/` — Despesas, previsão financeira         |
| `products`   | `pages/products/` — Cardápio, simulador de receita       |
| `settings`   | `pages/app/Settings` — Configurações do restaurante      |
| `employees`  | `pages/app/EmployeeCosts` — Gestão de equipe             |
| `ui`         | `components/ui/` — Componentes base (Button, Card, etc.) |
| `components` | `components/app/` — Componentes compartilhados           |
| `hooks`      | `hooks/` — Custom hooks                                  |
| `api`        | `lib/api` — Cliente HTTP, interceptors                   |
| `types`      | `types/` — TypeScript interfaces e enums                 |
| `store`      | `store/` — Zustand, estado global                        |
| `theme`      | `index.css` — Variáveis CSS, tema                        |
| `deps`       | Dependências do `package.json`                           |
| `skills`     | `.agent/skills/` — Skills do agente                      |
| `workflows`  | `.agent/workflows/` — Workflows do agente                |

---

## Exemplos Completos

### Commit simples

```
feat(sales): add Anota Ai report upload
```

### Commit com corpo

```
fix(finance): fix expense filter by month

The filter was comparing the month using the 0-based index from
the API with the 1-based value from the selector. Converts
before sending the query.
```

### Commit com breaking change

```
refactor(api)!: change sales endpoint response structure

BREAKING CHANGE: the `totalAmount` field now returns as string
instead of number to preserve decimal precision. All consumers
must use Number() to convert.
```

### Commit com referência a issue

```
fix(dashboard): fix error loading forecast without data

Closes #42
```

---

## Regras de Validação

Ao gerar ou revisar uma mensagem de commit, verifique:

```
📝 COMMIT MESSAGE
✗ ERRO: Tipo inválido (usar apenas: feat, fix, refactor, style, docs, test, chore, perf, ci, build)
✗ ERRO: Descrição em pt-BR (deve ser inglês)
✗ ERRO: Descrição começando com maiúscula
✗ ERRO: Descrição com ponto final
✗ ERRO: Linha principal excede 72 caracteres
✗ ERRO: Verbo não imperativo (ex: "adding" → "add")
⚠️ AVISO: Commit sem escopo (adicionar quando possível)
⚠️ AVISO: Corpo sem linha em branco separando da descrição
✓ BOM: Formato correto e descrição clara
```

---

## Quando Aplicar

Esta skill deve ser seguida **SEMPRE** que:

1. O agente gerar uma mensagem de commit
2. O agente sugerir uma mensagem de commit
3. O usuário pedir para commitar alterações
4. O agente executar `git commit`

> **IMPORTANTE**: Sempre gere mensagens de commit em inglês. O padrão do SmartResto é en-US.
