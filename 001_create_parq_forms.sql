-- ============================================================
-- PAR-Q — Evolution Fitness
-- Tabela: parq_forms
-- ============================================================
-- Este schema foi desenhado para ser reutilizado futuramente
-- pelo aplicativo/sistema completo da Evolution Fitness.
-- As respostas ficam estruturadas (não como texto único) para
-- permitir consultas futuras na área de Avaliação Física.
-- ============================================================

create extension if not exists "pgcrypto"; -- para gen_random_uuid()

create table if not exists public.parq_forms (
  id uuid primary key default gen_random_uuid(),

  -- Se já existir uma tabela de alunos (students/alunos), troque a linha
  -- abaixo para referenciá-la. Deixado nullable para permitir o
  -- preenchimento por um aluno ainda não cadastrado no sistema.
  student_id uuid references public.students(id),

  -- Dados do aluno no momento do preenchimento (snapshot)
  full_name text not null,
  birth_date date not null,
  phone text not null,
  filled_at timestamptz not null default now(),

  -- As 7 perguntas oficiais do PAR-Q (true = SIM, false = NÃO)
  question_1 boolean not null,
  question_2 boolean not null,
  question_3 boolean not null,
  question_4 boolean not null,
  question_5 boolean not null,
  question_6 boolean not null,
  question_7 boolean not null,

  -- Índices (1 a 7) das perguntas respondidas com SIM, para consulta rápida
  yes_questions integer[] not null default '{}',
  observations text,

  declaration_confirmed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.parq_forms is
  'Registros do Questionário de Prontidão para Atividade Física (PAR-Q) preenchidos pelos alunos da Evolution Fitness.';

create index if not exists idx_parq_forms_student_id on public.parq_forms (student_id);
create index if not exists idx_parq_forms_filled_at on public.parq_forms (filled_at desc);
create index if not exists idx_parq_forms_full_name on public.parq_forms (full_name);

-- ------------------------------------------------------------
-- updated_at automático
-- ------------------------------------------------------------
create or replace function public.set_parq_forms_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_parq_forms_updated_at on public.parq_forms;
create trigger trg_parq_forms_updated_at
  before update on public.parq_forms
  for each row execute function public.set_parq_forms_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
-- O formulário público precisa conseguir ENVIAR (insert), mas
-- ninguém de fora deve conseguir LER os registros de saúde.
-- A leitura fica restrita a usuários autenticados (equipe/admin).
-- ------------------------------------------------------------

alter table public.parq_forms enable row level security;

drop policy if exists "parq_forms_insert_publico" on public.parq_forms;
create policy "parq_forms_insert_publico"
  on public.parq_forms
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "parq_forms_select_equipe" on public.parq_forms;
create policy "parq_forms_select_equipe"
  on public.parq_forms
  for select
  to authenticated
  using (true);

drop policy if exists "parq_forms_update_equipe" on public.parq_forms;
create policy "parq_forms_update_equipe"
  on public.parq_forms
  for update
  to authenticated
  using (true)
  with check (true);

-- Ninguém pode deletar pelo cliente; use o dashboard/service role se necessário.

-- ------------------------------------------------------------
-- Ajuste antes de rodar:
-- 1) Se já existir tabela de alunos com nome diferente de
--    "students", troque a referência de student_id acima.
-- 2) Se não existir tabela de alunos ainda, remova a linha do
--    "references public.students(id)" e mantenha só "uuid".
-- 3) Depois de aplicar, verifique no Supabase Dashboard se RLS
--    está habilitado (Authentication > Policies).
-- ------------------------------------------------------------
