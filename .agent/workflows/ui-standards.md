---
description: Padrões de UI para cards, cores e gráficos no SmartResto
---

# Guia de Padronização de UI - SmartResto

## Cores Semânticas (usar variáveis CSS)

| Contexto             | Cor      | Classe                                                          | Uso                        |
| -------------------- | -------- | --------------------------------------------------------------- | -------------------------- |
| **Receita/Positivo** | Verde    | `text-success`, `bg-success/10`, `border-l-success`             | Vendas, lucro, crescimento |
| **Despesa/Negativo** | Vermelho | `text-destructive`, `bg-destructive/10`, `border-l-destructive` | Gastos, dívidas, alertas   |
| **Neutro/Destaque**  | Amarelo  | `text-primary`, `bg-primary/10`, `border-l-primary`             | Metas, previsões, CTAs     |
| **Informativo**      | Cinza    | `text-muted-foreground`, `bg-muted/20`                          | Textos secundários         |

---

## Padrão de Cards

### Card com Borda Lateral (Padrão Principal)

Usar para cards de métricas importantes. Sempre incluir `shadow-sm` para profundidade.

```tsx
// Card de Receita (verde)
<Card className="border-l-4 border-l-success shadow-sm">

// Card de Despesa (vermelho)
<Card className="border-l-4 border-l-destructive shadow-sm">

// Card Neutro/Meta (primário - amarelo)
<Card className="border-l-4 border-l-primary shadow-sm">

// Card Informativo (sem borda lateral)
<Card className="shadow-sm">
```

### Estrutura do CardHeader

```tsx
<CardHeader className="pb-2">
  <div className="flex items-center justify-between">
    <CardTitle className="text-lg font-medium flex items-center gap-2">
      <Icon className="h-5 w-5 text-{cor}" />
      Título do Card
    </CardTitle>
    <IconSecundario className="h-4 w-4 text-muted-foreground" />
  </div>
</CardHeader>
```

### Ícones com Background

```tsx
// Para ícones de destaque dentro de cards
<div className="h-8 w-8 rounded-lg bg-{cor}/10 flex items-center justify-center">
  <Icon className="h-4 w-4 text-{cor}" aria-hidden="true" />
</div>
```

---

## Padrão de Gráficos (Recharts)

### Cores de Gráficos

Usar as variáveis CSS `--chart-1` a `--chart-5` ou cores específicas:

```tsx
// Cor primária para linha/área principal
stroke="#FACC15"        // Amarelo (primary)
fill="url(#gradient)"   // Gradiente para áreas

// Gradiente padrão
<linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
  <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
</linearGradient>

// Grid e eixos
<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
<XAxis stroke="hsl(var(--muted-foreground))" />
<YAxis stroke="hsl(var(--muted-foreground))" />
```

### Tooltip Personalizado

```tsx
<Tooltip
  contentStyle={{
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
  }}
  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
/>
```

---

## Badges e Status

### Badge de Tendência

```tsx
// Positivo
<Badge className="bg-success/10 text-success hover:bg-success/20">
  ↑ 12.5%
</Badge>

// Negativo
<Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
  ↓ 5.2%
</Badge>
```

### Badge Informativo

```tsx
<Badge variant="secondary" className="text-xs">
  Novo
</Badge>
```

---

## Progress Bars

```tsx
// Barra de progresso padrão (usa cor primary)
<Progress value={75} className="h-2" />

// Para contexto de receita, adicionar wrapper verde se necessário
<div className="[&>div]:bg-success">
  <Progress value={75} className="h-2" />
</div>
```

---

## Formatação de Moeda

Usar sempre o formatador padronizado:

```tsx
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
```

---

## Skeleton Loading

```tsx
// Card
<Card className="animate-pulse">
  <CardHeader className="pb-2">
    <Skeleton className="h-4 w-24" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-3 w-20" />
  </CardContent>
</Card>

// Gráfico
<Skeleton className="h-[300px] w-full" />
```

---

## Checklist de Revisão

Antes de criar novos componentes, verificar:

- [ ] Card usa `border-l-4 border-l-{cor} shadow-sm` quando apropriado
- [ ] Cores semânticas corretas (success/destructive/primary)
- [ ] Ícones com `h-5 w-5` no header, `h-4 w-4` para secundários
- [ ] `shadow-sm` em todos os cards elevados
- [ ] Textos secundários usam `text-muted-foreground`
- [ ] Formatação de moeda usa `formatCurrency()`
- [ ] Skeleton loading implementado
