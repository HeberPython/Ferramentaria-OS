-- Habilitar extensão para UUID
create extension if not exists "pgcrypto";

-- Tabela de usuários (admin/editores da ferramentaria)
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  senha_hash text not null,
  role text not null default 'editor', -- 'admin' | 'editor'
  ativo boolean default true,
  criado_em timestamptz default now()
);

-- Tabela de pedidos
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  numero serial,
  setor text not null,
  solicitante text not null,
  email_contato text not null,
  telefone text,
  tipo_servico text not null,
  descricao text not null,
  urgencia text not null default 'normal',
  prazo_desejado date,
  prazo_definido date,
  status text not null default 'recebido',
  responsavel_id uuid references usuarios(id),
  token_acompanhamento text unique default encode(gen_random_bytes(16), 'hex'),
  observacoes_internas text,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Tabela de histórico de status
create table if not exists historico_status (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id) on delete cascade,
  status_anterior text,
  status_novo text not null,
  observacao text,
  usuario_nome text,
  criado_em timestamptz default now()
);

-- Tabela de comentários
create table if not exists comentarios (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id) on delete cascade,
  usuario_nome text not null,
  conteudo text not null,
  interno boolean default false,
  criado_em timestamptz default now()
);

-- Trigger para atualizar atualizado_em
create or replace function update_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger pedidos_atualizado_em
  before update on pedidos
  for each row execute function update_atualizado_em();

-- RLS (Row Level Security) - deixar aberto para API do Next.js
alter table pedidos enable row level security;
alter table usuarios enable row level security;
alter table historico_status enable row level security;
alter table comentarios enable row level security;

-- Política permissiva para service role (API Next.js usa service role key)
create policy "Allow service role all" on pedidos for all using (true);
create policy "Allow service role all" on usuarios for all using (true);
create policy "Allow service role all" on historico_status for all using (true);
create policy "Allow service role all" on comentarios for all using (true);
