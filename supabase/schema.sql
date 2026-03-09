-- Personal Vocabulary Dictionary schema (PostgreSQL / Supabase)

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'learning_status') then
    create type learning_status as enum ('new', 'learning', 'known', 'trouble');
  end if;
end
$$;

create table if not exists public.vocab (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  term text not null,
  lemma text not null,
  pos text not null,
  definition_easy_en text not null,
  meaning_fa text not null,
  user_example text not null,
  ai_examples text[] not null default '{}',
  collocations text[] not null default '{}',
  tags text[] not null default '{}',
  status learning_status not null default 'new',
  created_at timestamptz not null default now(),
  unique (user_id, lemma)
);

create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  vocab_id uuid not null references public.vocab(id) on delete cascade,
  created_at timestamptz not null default now(),
  user_sentences text[] not null default '{}',
  score_avg int not null check (score_avg >= 0 and score_avg <= 100),
  feedback jsonb not null default '{}'::jsonb,
  fixed_sentences text[] not null default '{}',
  pass_fail boolean not null
);

create table if not exists public.srs_state (
  user_id uuid not null,
  vocab_id uuid not null references public.vocab(id) on delete cascade,
  ease numeric(4,2) not null default 2.50,
  interval_days int not null default 1,
  due_at timestamptz not null default now(),
  lapses int not null default 0,
  streak int not null default 0,
  last_score int check (last_score >= 0 and last_score <= 100),
  last_reviewed_at timestamptz,
  primary key (user_id, vocab_id)
);

create table if not exists public.conversation_state (
  user_id uuid primary key,
  mode text not null default 'idle',
  pending_vocab_id uuid references public.vocab(id) on delete set null,
  step text not null default 'none',
  updated_at timestamptz not null default now()
);

-- Ensure trigram extension exists for search indexes.
create extension if not exists pg_trgm;

create index if not exists idx_vocab_user_created_at on public.vocab (user_id, created_at desc);
create index if not exists idx_vocab_user_status on public.vocab (user_id, status);
create index if not exists idx_vocab_tags_gin on public.vocab using gin (tags);
create index if not exists idx_vocab_term_trgm on public.vocab using gin (term gin_trgm_ops);
create index if not exists idx_vocab_lemma_trgm on public.vocab using gin (lemma gin_trgm_ops);
create index if not exists idx_srs_due on public.srs_state (user_id, due_at);
create index if not exists idx_srs_lapses on public.srs_state (user_id, lapses desc);
create index if not exists idx_attempts_user_created on public.practice_attempts (user_id, created_at desc);

-- Select next 10 words for daily session.
create or replace function public.select_daily_review_words(p_user_id uuid, p_limit int default 10)
returns table (
  vocab_id uuid,
  term text,
  lemma text,
  pos text,
  definition_easy_en text,
  meaning_fa text,
  status learning_status,
  due_at timestamptz,
  lapses int,
  last_score int
)
language sql
stable
as $$
  with due_words as (
    select
      v.id as vocab_id,
      v.term,
      v.lemma,
      v.pos,
      v.definition_easy_en,
      v.meaning_fa,
      v.status,
      s.due_at,
      s.lapses,
      s.last_score
    from public.vocab v
    join public.srs_state s
      on s.vocab_id = v.id and s.user_id = v.user_id
    where v.user_id = p_user_id
      and s.due_at <= now()
    order by s.due_at asc, s.lapses desc, s.last_score asc nulls first
    limit p_limit
  ),
  fill_new as (
    select
      v.id as vocab_id,
      v.term,
      v.lemma,
      v.pos,
      v.definition_easy_en,
      v.meaning_fa,
      v.status,
      now() as due_at,
      0 as lapses,
      null::int as last_score
    from public.vocab v
    where v.user_id = p_user_id
      and v.id not in (select vocab_id from due_words)
      and v.status = 'new'
    order by v.created_at desc
    limit greatest(0, p_limit - (select count(*) from due_words))
  )
  select * from due_words
  union all
  select * from fill_new
  limit p_limit;
$$;

-- Update SRS metrics based on score bucket.
create or replace function public.apply_srs_review(
  p_user_id uuid,
  p_vocab_id uuid,
  p_score int
)
returns table (
  ease numeric(4,2),
  interval_days int,
  due_at timestamptz,
  lapses int,
  streak int
)
language plpgsql
as $$
declare
  v_ease numeric(4,2);
  v_interval int;
  v_lapses int;
  v_streak int;
  v_due timestamptz;
begin
  insert into public.srs_state (user_id, vocab_id)
  values (p_user_id, p_vocab_id)
  on conflict (user_id, vocab_id) do nothing;

  select s.ease, s.interval_days, s.lapses, s.streak
    into v_ease, v_interval, v_lapses, v_streak
  from public.srs_state s
  where s.user_id = p_user_id and s.vocab_id = p_vocab_id
  for update;

  if p_score >= 90 then
    v_ease := least(3.20, v_ease + 0.05);
    v_interval := greatest(2, ceil(v_interval * v_ease)::int);
    v_streak := v_streak + 1;
  elsif p_score >= 70 then
    v_interval := greatest(1, ceil(v_interval * 1.5)::int);
    v_streak := v_streak + 1;
  else
    v_ease := greatest(1.30, v_ease - 0.20);
    v_interval := 1;
    v_lapses := v_lapses + 1;
    v_streak := 0;
  end if;

  v_due := now() + make_interval(days => v_interval);

  update public.srs_state s
  set ease = v_ease,
      interval_days = v_interval,
      due_at = v_due,
      lapses = v_lapses,
      streak = v_streak,
      last_score = p_score,
      last_reviewed_at = now()
  where s.user_id = p_user_id and s.vocab_id = p_vocab_id;

  return query
  select s.ease, s.interval_days, s.due_at, s.lapses, s.streak
  from public.srs_state s
  where s.user_id = p_user_id and s.vocab_id = p_vocab_id;
end;
$$;
