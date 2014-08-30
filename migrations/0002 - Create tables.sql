create table if not exists players (
    id serial not null primary key,
    name varchar(100) not null,
    email varchar(100),
    affiliation varchar(100)
);

create table if not exists game_types (
    id smallint not null primary key,
    name varchar(100) not null
);

insert into game_types (id, name) select 1, 'Singles to 11' where not exists (select * from game_types where id = 1);
insert into game_types (id, name) select 2, 'Doubles to 11' where not exists (select * from game_types where id = 2);
insert into game_types (id, name) select 3, 'Singles to 21' where not exists (select * from game_types where id = 3);
insert into game_types (id, name) select 4, 'Doubles to 21' where not exists (select * from game_types where id = 4);

create table if not exists games (
    id serial not null primary key,
    played_date timestamp with time zone not null,
    game_type_id smallint not null references game_types(id)
);

create table if not exists games_players (
    id serial not null primary key,
    game_id integer not null references games(id),
    player_id integer not null references players(id),
    is_winner boolean not null,
    score smallint not null
);