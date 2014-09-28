create table if not exists matches (
    id serial not null primary key
);

do $$
begin
    if not exists (select * from information_schema.columns c where c.table_schema = 'public' and c.table_name = 'games' and c.column_name = 'match_id') then

        alter table games add column match_id int null references matches(id);

    end if;
end;
$$;