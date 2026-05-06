-- Supabase SQL for password-protected blog comments.
-- Run this once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  author_name text not null,
  password_hash text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_comments_post_slug_length check (char_length(post_slug) between 1 and 300),
  constraint blog_comments_author_name_length check (char_length(author_name) between 1 and 40),
  constraint blog_comments_content_length check (char_length(content) between 1 and 2000)
);

create table if not exists public.blog_comment_password_attempts (
  comment_id uuid primary key references public.blog_comments(id) on delete cascade,
  failed_count integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now(),
  constraint blog_comment_password_attempts_failed_count_nonnegative check (failed_count >= 0)
);

create index if not exists blog_comments_post_created_idx
  on public.blog_comments (post_slug, created_at);

create index if not exists blog_comments_recent_post_idx
  on public.blog_comments (post_slug, created_at desc);

create index if not exists blog_comment_password_attempts_locked_idx
  on public.blog_comment_password_attempts (locked_until)
  where locked_until is not null;

alter table public.blog_comments enable row level security;
alter table public.blog_comment_password_attempts enable row level security;

-- Keep tables private from browser clients. Access is only through RPC functions below.
revoke all on table public.blog_comments from anon, authenticated;
revoke all on table public.blog_comment_password_attempts from anon, authenticated;

create or replace function public.blog_get_comments(p_post_slug text)
returns table (
  id uuid,
  post_slug text,
  author_name text,
  content text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public, extensions
as $$
  select
    c.id,
    c.post_slug,
    c.author_name,
    c.content,
    c.created_at,
    c.updated_at
  from public.blog_comments as c
  where c.post_slug = btrim(p_post_slug)
  order by c.created_at asc;
$$;

create or replace function public.blog_create_comment(
  p_post_slug text,
  p_author_name text,
  p_password text,
  p_content text
)
returns table (
  id uuid,
  post_slug text,
  author_name text,
  content text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_post_slug text := btrim(coalesce(p_post_slug, ''));
  v_author_name text := btrim(coalesce(p_author_name, ''));
  v_password text := coalesce(p_password, '');
  v_content text := btrim(coalesce(p_content, ''));
begin
  if char_length(v_post_slug) < 1 or char_length(v_post_slug) > 300 then
    raise exception 'invalid_post_slug';
  end if;

  if char_length(v_author_name) < 1 or char_length(v_author_name) > 40 then
    raise exception 'invalid_author_name';
  end if;

  if char_length(v_password) < 4 or char_length(v_password) > 72 then
    raise exception 'invalid_password';
  end if;

  if char_length(v_content) < 1 or char_length(v_content) > 2000 then
    raise exception 'invalid_content';
  end if;

  if (
    select count(*)
    from public.blog_comments as c
    where c.post_slug = v_post_slug
      and c.created_at > now() - interval '1 minute'
  ) >= 5 then
    raise exception 'rate_limited';
  end if;

  if exists (
    select 1
    from public.blog_comments as c
    where c.post_slug = v_post_slug
      and lower(c.author_name) = lower(v_author_name)
      and c.content = v_content
      and c.created_at > now() - interval '10 minutes'
  ) then
    raise exception 'duplicate_comment';
  end if;

  return query
  insert into public.blog_comments as c (post_slug, author_name, password_hash, content)
  values (v_post_slug, v_author_name, crypt(v_password, gen_salt('bf')), v_content)
  returning
    c.id,
    c.post_slug,
    c.author_name,
    c.content,
    c.created_at,
    c.updated_at;
end;
$$;

create or replace function public.blog_update_comment(
  p_comment_id uuid,
  p_password text,
  p_content text
)
returns table (
  id uuid,
  post_slug text,
  author_name text,
  content text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_password text := coalesce(p_password, '');
  v_content text := btrim(coalesce(p_content, ''));
  v_comment public.blog_comments%rowtype;
  v_attempt public.blog_comment_password_attempts%rowtype;
  v_next_failed_count integer;
begin
  if char_length(v_password) < 4 or char_length(v_password) > 72 then
    return;
  end if;

  if char_length(v_content) < 1 or char_length(v_content) > 2000 then
    raise exception 'invalid_content';
  end if;

  select * into v_comment
  from public.blog_comments as c
  where c.id = p_comment_id;

  if not found then
    return;
  end if;

  select * into v_attempt
  from public.blog_comment_password_attempts as a
  where a.comment_id = p_comment_id
  for update;

  if found and v_attempt.locked_until is not null and v_attempt.locked_until > now() then
    return;
  end if;

  if v_comment.password_hash <> crypt(v_password, v_comment.password_hash) then
    if found and v_attempt.updated_at > now() - interval '15 minutes' then
      v_next_failed_count := v_attempt.failed_count + 1;
    else
      v_next_failed_count := 1;
    end if;

    insert into public.blog_comment_password_attempts as a (
      comment_id,
      failed_count,
      locked_until,
      updated_at
    ) values (
      p_comment_id,
      v_next_failed_count,
      case when v_next_failed_count >= 5 then now() + interval '15 minutes' else null end,
      now()
    )
    on conflict (comment_id) do update
      set failed_count = excluded.failed_count,
          locked_until = excluded.locked_until,
          updated_at = excluded.updated_at;

    return;
  end if;

  delete from public.blog_comment_password_attempts as a
  where a.comment_id = p_comment_id;

  return query
  update public.blog_comments as c
  set content = v_content,
      updated_at = now()
  where c.id = p_comment_id
  returning
    c.id,
    c.post_slug,
    c.author_name,
    c.content,
    c.created_at,
    c.updated_at;
end;
$$;

create or replace function public.blog_delete_comment(
  p_comment_id uuid,
  p_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_password text := coalesce(p_password, '');
  v_comment public.blog_comments%rowtype;
  v_attempt public.blog_comment_password_attempts%rowtype;
  v_next_failed_count integer;
begin
  if char_length(v_password) < 4 or char_length(v_password) > 72 then
    return false;
  end if;

  select * into v_comment
  from public.blog_comments as c
  where c.id = p_comment_id;

  if not found then
    return false;
  end if;

  select * into v_attempt
  from public.blog_comment_password_attempts as a
  where a.comment_id = p_comment_id
  for update;

  if found and v_attempt.locked_until is not null and v_attempt.locked_until > now() then
    return false;
  end if;

  if v_comment.password_hash <> crypt(v_password, v_comment.password_hash) then
    if found and v_attempt.updated_at > now() - interval '15 minutes' then
      v_next_failed_count := v_attempt.failed_count + 1;
    else
      v_next_failed_count := 1;
    end if;

    insert into public.blog_comment_password_attempts as a (
      comment_id,
      failed_count,
      locked_until,
      updated_at
    ) values (
      p_comment_id,
      v_next_failed_count,
      case when v_next_failed_count >= 5 then now() + interval '15 minutes' else null end,
      now()
    )
    on conflict (comment_id) do update
      set failed_count = excluded.failed_count,
          locked_until = excluded.locked_until,
          updated_at = excluded.updated_at;

    return false;
  end if;

  delete from public.blog_comment_password_attempts as a
  where a.comment_id = p_comment_id;

  delete from public.blog_comments as c
  where c.id = p_comment_id;

  return true;
end;
$$;

revoke all on function public.blog_get_comments(text) from public;
revoke all on function public.blog_create_comment(text, text, text, text) from public;
revoke all on function public.blog_update_comment(uuid, text, text) from public;
revoke all on function public.blog_delete_comment(uuid, text) from public;

grant execute on function public.blog_get_comments(text) to anon, authenticated;
grant execute on function public.blog_create_comment(text, text, text, text) to anon, authenticated;
grant execute on function public.blog_update_comment(uuid, text, text) to anon, authenticated;
grant execute on function public.blog_delete_comment(uuid, text) to anon, authenticated;
