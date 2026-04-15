# Guia de Deploy — Ferramentaria OS

## Pré-requisitos

- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta no [Resend](https://resend.com) (gratuita até 3.000 e-mails/mês)
- Conta no [GitHub](https://github.com)
- Conta na [Vercel](https://vercel.com) (gratuita)
- Node.js 18+ instalado localmente

---

## Passo 1 — Criar projeto no Supabase e rodar o schema

1. Acesse [app.supabase.com](https://app.supabase.com) e clique em **New Project**
2. Defina nome, senha do banco e região (escolha `South America (São Paulo)` se disponível)
3. Aguarde o projeto ser criado (~2 minutos)
4. No menu lateral, vá em **SQL Editor** → clique em **New Query**
5. Copie todo o conteúdo de `supabase/schema.sql` e cole no editor
6. Clique em **Run** (ou `Ctrl+Enter`)
7. Você verá as tabelas criadas em **Table Editor**

### Coletar as chaves do Supabase

No menu lateral, vá em **Settings** → **API**:
- **Project URL**: `https://xxxx.supabase.co` → é o `NEXT_PUBLIC_SUPABASE_URL`
- **anon public**: chave pública → é o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role secret**: chave secreta → é o `SUPABASE_SERVICE_ROLE_KEY`

**Atenção:** Nunca exponha a `service_role` chave no frontend.

---

## Passo 2 — Criar conta no Resend e verificar domínio de e-mail

1. Acesse [resend.com](https://resend.com) e crie uma conta
2. No painel, vá em **Domains** → **Add Domain**
3. Adicione seu domínio (ex: `seudominio.com`) e siga as instruções para adicionar os registros DNS
4. Aguarde a verificação (pode levar alguns minutos)
5. Vá em **API Keys** → **Create API Key**
6. Copie a chave gerada → é o `RESEND_API_KEY`
7. O `EMAIL_FROM` deve usar o domínio verificado (ex: `ferramentaria@seudominio.com`)

**Opção rápida para testes:** Use `onboarding@resend.dev` como `EMAIL_FROM` (funciona sem verificar domínio, mas só envia para o seu próprio e-mail cadastrado no Resend).

---

## Passo 3 — Upload para o GitHub

```bash
# Na pasta do projeto
cd ferramentaria-os

# Inicializar repositório
git init
git add .
git commit -m "feat: inicial - sistema Ferramentaria OS"

# Criar repositório no GitHub (via GitHub CLI ou manualmente)
gh repo create ferramentaria-os --public --push
# OU
# Crie o repositório em github.com e depois:
git remote add origin https://github.com/SEU_USUARIO/ferramentaria-os.git
git push -u origin main
```

**Importante:** Não commite o arquivo `.env.local`. Ele já está no `.gitignore` (adicione se necessário).

---

## Passo 4 — Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
2. Clique em **Add New Project**
3. Selecione o repositório `ferramentaria-os`
4. Na tela de configuração, clique em **Environment Variables** e adicione:

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role key) |
| `JWT_SECRET` | Uma string longa e aleatória (mínimo 32 caracteres) |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxx` |
| `EMAIL_FROM` | `ferramentaria@seudominio.com` |
| `EMAIL_ADMIN` | `admin@empresa.com` |
| `NEXT_PUBLIC_BASE_URL` | `https://seu-projeto.vercel.app` (preencher depois) |

> **Dica para JWT_SECRET:** Gere uma string segura com: `openssl rand -base64 48`

5. Clique em **Deploy** e aguarde o build (~2 minutos)
6. Após o deploy, copie a URL gerada (ex: `https://ferramentaria-os.vercel.app`)
7. Volte nas **Environment Variables** da Vercel e atualize `NEXT_PUBLIC_BASE_URL` com a URL real
8. Clique em **Redeploy** → **Redeploy** para aplicar a variável

---

## Passo 5 — Criar o primeiro usuário admin

Você precisa inserir o primeiro admin diretamente no Supabase, pois não há tela de auto-cadastro.

### Opção A: Via SQL Editor no Supabase

1. Vá em **SQL Editor** no Supabase
2. Execute o script abaixo, substituindo os dados:

```sql
-- Gerar hash da senha "SuaSenhaAqui" (substitua antes de executar)
-- O hash abaixo é de exemplo, não use em produção!
INSERT INTO usuarios (nome, email, senha_hash, role)
VALUES (
  'Administrador',
  'admin@empresa.com',
  '$2a$12$HASH_DA_SENHA_AQUI',  -- veja instruções abaixo
  'admin'
);
```

Para gerar o hash correto, use Node.js localmente:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('SuaSenha123', 12).then(h => console.log(h))"
```

Copie o hash gerado e substitua no SQL acima.

### Opção B: Via script local

```bash
# Na pasta do projeto, com .env.local configurado
node scripts/criar-admin.js
```

Crie o arquivo `scripts/criar-admin.js`:
```javascript
const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  const senha_hash = await bcrypt.hash('SuaSenha123', 12)
  
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{
      nome: 'Administrador',
      email: 'admin@empresa.com',
      senha_hash,
      role: 'admin'
    }])
    .select()
    .single()
  
  if (error) console.error('Erro:', error)
  else console.log('Admin criado:', data.email)
}

main()
```

---

## Passo 6 — URL final e como compartilhar

Após o deploy:

| Página | URL |
|--------|-----|
| Painel público (kanban) | `https://seu-projeto.vercel.app/` |
| Formulário de pedido | `https://seu-projeto.vercel.app/solicitar` |
| Login admin | `https://seu-projeto.vercel.app/admin` |
| Dashboard admin | `https://seu-projeto.vercel.app/admin/dashboard` |

### Como compartilhar com os usuários

1. **Para solicitantes:** Envie o link `/solicitar` para que abram novos pedidos
2. **Para acompanhamento:** Cada pedido gera um link único `/acompanhar/[token]` que é enviado por e-mail automaticamente
3. **Para operadores:** Crie usuários no painel `/admin/dashboard/usuarios` e envie o link `/admin` com as credenciais

---

## Configuração de domínio personalizado (opcional)

1. Na Vercel, vá em **Settings** → **Domains** do seu projeto
2. Adicione seu domínio (ex: `ferramentaria.seudominio.com`)
3. Configure o registro CNAME no seu provedor de DNS apontando para `cname.vercel-dns.com`
4. Atualize a variável `NEXT_PUBLIC_BASE_URL` para o novo domínio
5. Atualize também o domínio no Resend

---

## Solução de problemas comuns

**Build falha na Vercel:**
- Verifique se todas as variáveis de ambiente estão preenchidas
- Consulte os logs do build em Functions → View Function Logs

**E-mails não são enviados:**
- Confirme que o `RESEND_API_KEY` está correto
- Confirme que o domínio do `EMAIL_FROM` está verificado no Resend
- Verifique os logs de e-mail em resend.com/emails

**Erro de autenticação:**
- Confirme que o `JWT_SECRET` está configurado e tem pelo menos 32 caracteres
- Limpe os cookies do navegador e tente novamente

**Pedidos não aparecem no banco:**
- Confirme que o schema foi executado corretamente no Supabase
- Verifique se o `SUPABASE_SERVICE_ROLE_KEY` é a chave `service_role` e não a `anon`
