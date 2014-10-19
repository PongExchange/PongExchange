do $$
begin
  alter table players drop column if exists affiliation;

  create table if not exists affiliations (
      id serial not null primary key,
      name varchar(100) not null
  );

  if not exists (select * from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'players' and c.column_name = 'affiliation_id') then
    alter table players add column affiliation_id int null references affiliations(id);
  end if;
end;
$$;
