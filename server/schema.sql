-- Tables
create table if not exists public.users (
  id bigint primary key,          -- telegram user id
  first_name text,
  last_name text,
  username text,
  phone text,
  balance integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id bigserial primary key,
  title text not null,
  partner text,
  price integer not null,
  description text,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  service_id bigint not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, service_id)
);

create table if not exists public.bonus_transactions (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  amount integer not null,
  reason text,
  created_at timestamptz not null default now()
);

-- Seed demo services
insert into public.services (title, partner, price, description, visible)
values
  ('1 месяц абонемента', 'Get Fit Gym', 100, 'Доступ ко всем зонам на 30 дней', true),
  ('Сеанс массажа 60 мин', 'Relax Studio', 80, 'Спортивный/релакс, по записи', true)
on conflict do nothing;

-- Functions (atomic operations)

-- Grant bonus by phone
create or replace function public.grant_bonus_by_phone(p_phone text, p_amount int, p_reason text default 'admin')
returns void
language plpgsql
as $$
declare
  v_user_id bigint;
begin
  select id into v_user_id from public.users where phone = p_phone limit 1;
  if v_user_id is null then
    raise exception 'USER_NOT_FOUND';
  end if;
  update public.users set balance = balance + p_amount where id = v_user_id;
  insert into public.bonus_transactions(user_id, amount, reason) values (v_user_id, p_amount, p_reason);
end;
$$;

-- Purchase once per service with balance check (atomic)
create or replace function public.purchase_service(p_user_id bigint, p_service_id bigint)
returns void
language plpgsql
as $$
declare
  v_price int;
  v_balance int;
  v_exists int;
begin
  select price into v_price from public.services where id = p_service_id and visible = true;
  if v_price is null then
    raise exception 'SERVICE_NOT_FOUND';
  end if;

  select count(*) into v_exists from public.purchases where user_id = p_user_id and service_id = p_service_id;
  if v_exists > 0 then
    raise exception 'ALREADY_PURCHASED';
  end if;

  select balance into v_balance from public.users where id = p_user_id;
  if v_balance is null or v_balance < v_price then
    raise exception 'INSUFFICIENT_FUNDS';
  end if;

  -- Atomic updates
  update public.users set balance = balance - v_price where id = p_user_id;
  insert into public.purchases(user_id, service_id) values (p_user_id, p_service_id);
  insert into public.bonus_transactions(user_id, amount, reason) values (p_user_id, -v_price, concat('purchase:', p_service_id));
end;
$$;
