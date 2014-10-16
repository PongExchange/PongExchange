do $$
begin
  create table if not exists roles(
    id smallint not null primary key,
    name varchar(100) not null
  );

  insert into roles (id, name) select 1, 'pending approval' where not exists (select * from roles where id = 1);
  insert into roles (id, name) select 2, 'invited' where not exists (select * from roles where id = 2);
  insert into roles (id, name) select 3, 'active' where not exists (select * from roles where id = 3);
  insert into roles (id, name) select 4, 'admin' where not exists (select * from roles where id = 4);

  if not exists (select * from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'players' and c.column_name = 'role_id') then
      ALTER TABLE players ADD COLUMN role_id smallint NOT NULL DEFAULT 1 references roles(id);
    end if;
end;
$$;