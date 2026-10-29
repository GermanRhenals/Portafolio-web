-- Votación del nombre del próximo videojuego del portafolio.
--
-- La tabla de conteos es de lectura pública. La escritura pasa solo por la RPC
-- `vote_game_name`, que corre con `security definer` y aplica un enfriamiento
-- por IP (guardada como hash) para que el botón no sea un amplificador.
--
-- Se aplica una sola vez sobre el proyecto de Supabase que ya usa el
-- portafolio. No hay migraciones automáticas en este repositorio.

create table if not exists public.portfolio_game_votes (
  option_key text primary key,
  votes integer not null default 0 check (votes >= 0)
);

insert into public.portfolio_game_votes (option_key)
values
  ('shadows-of-duty'),
  ('green-crossfire'),
  ('ghost-protocol'),
  ('memory-of-shadows')
on conflict (option_key) do nothing;

create table if not exists public.portfolio_game_vote_log (
  id bigint generated always as identity primary key,
  option_key text not null references public.portfolio_game_votes (option_key) on delete cascade,
  voter_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_game_vote_log_recent_idx
  on public.portfolio_game_vote_log (voter_hash, created_at desc);

alter table public.portfolio_game_votes enable row level security;
alter table public.portfolio_game_vote_log enable row level security;

-- Lectura pública de los conteos; sin políticas de escritura directa.
drop policy if exists "portfolio game votes lectura publica" on public.portfolio_game_votes;
create policy "portfolio game votes lectura publica"
  on public.portfolio_game_votes
  for select
  to anon, authenticated
  using (true);

revoke all on public.portfolio_game_votes from anon, authenticated;
grant select on public.portfolio_game_votes to anon, authenticated;
revoke all on public.portfolio_game_vote_log from anon, authenticated;

create or replace function public.get_game_name_votes()
returns table (option_key text, votes integer)
language sql
security definer
set search_path = public
stable
as $$
  select g.option_key, g.votes
  from public.portfolio_game_votes g
  order by g.option_key;
$$;

revoke all on function public.get_game_name_votes() from public;
grant execute on function public.get_game_name_votes() to anon, authenticated;

create or replace function public.vote_game_name(p_option text)
returns table (option_key text, votes integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_headers json;
  v_ip text;
  v_hash text;
begin
  if not exists (
    select 1 from public.portfolio_game_votes g where g.option_key = p_option
  ) then
    raise exception 'opción inválida' using errcode = '22023';
  end if;

  v_headers := nullif(current_setting('request.headers', true), '')::json;
  v_ip := coalesce(v_headers ->> 'x-forwarded-for', '');
  v_ip := split_part(v_ip, ',', 1);
  -- Sin IP (por ejemplo, una llamada interna) se usa un hash aleatorio: no
  -- bloquea a nadie, pero tampoco permite abusar del enfriamiento.
  v_hash := md5(coalesce(nullif(v_ip, ''), gen_random_uuid()::text));

  if exists (
    select 1
    from public.portfolio_game_vote_log l
    where l.voter_hash = v_hash
      and l.created_at > now() - interval '10 minutes'
  ) then
    raise exception 'ya votaste' using errcode = '22023';
  end if;

  insert into public.portfolio_game_vote_log (option_key, voter_hash)
  values (p_option, v_hash);

  update public.portfolio_game_votes g
  set votes = g.votes + 1
  where g.option_key = p_option;

  return query
    select g.option_key, g.votes
    from public.portfolio_game_votes g
    order by g.option_key;
end;
$$;

revoke all on function public.vote_game_name(text) from public;
grant execute on function public.vote_game_name(text) to anon, authenticated;
