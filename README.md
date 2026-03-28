# 💰 FinDash — Controle Financeiro Pessoal

Dashboard financeiro completo com autenticação, sincronização em nuvem, IA e cotações em tempo real.

**[🚀 Acessar o app](https://finance-dashboard-omega-ashy.vercel.app)**

---

## Funcionalidades

**Finanças pessoais**
- Transações com categorias, tags e filtros por período
- Orçamento mensal por categoria com alertas de estouro
- Recorrências (receitas e despesas fixas mensais)
- Metas financeiras com barra de progresso e alertas de prazo
- Reserva de emergência com indicador visual
- Dívidas com simulador de quitação antecipada
- Projeção de fluxo de caixa para 12 meses

**Investimentos**
- Carteira com ações, FIIs, cripto, renda fixa
- Suporte a frações (ex: 0.0022 BTC)
- Calculadora USD → BRL para cripto
- Cotações automáticas via [brapi.dev](https://brapi.dev)
- Dividendos e histórico de aportes por ativo
- Watchlist com preço alvo e notas
- Evolução patrimonial com snapshots mensais

**Inteligência Artificial**
- Insights automáticos no dashboard (via Groq)
- Chat financeiro com contexto completo dos seus dados

**Relatórios**
- Receitas vs despesas (12 meses)
- Comparativo anual entre dois anos
- Evolução do saldo
- Gastos por categoria
- Score de saúde financeira (0–100)

**Calculadoras**
- Juros compostos com gráfico
- Simulador de aposentadoria

**Outros**
- Notas com cores personalizadas
- Exportar/importar transações em CSV
- Backup e restore completo em JSON
- Modo claro e escuro
- Layout responsivo (mobile e desktop)
- PWA — instale como app no celular

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + TypeScript + Vite |
| Estilo | Tailwind CSS |
| Gráficos | Recharts |
| Backend | Supabase (PostgreSQL + Auth) |
| IA | Groq (llama-3.3-70b) |
| Cotações | brapi.dev |
| Deploy | Vercel |

---

## Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/loaded7/finance-dashboard.git
cd finance-dashboard

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves

# Inicie o servidor
npm run dev
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_BRAPI_TOKEN=seu_token_brapi
VITE_GROQ_API_KEY=sua_chave_groq
```

### Banco de dados

Execute o arquivo `supabase-schema.sql` no SQL Editor do seu projeto Supabase para criar todas as tabelas necessárias.

---

## Deploy

O projeto está configurado para deploy automático no Vercel. Qualquer push na branch `main` dispara um novo deploy.

Adicione as variáveis de ambiente no painel do Vercel em **Settings → Environment Variables**.
