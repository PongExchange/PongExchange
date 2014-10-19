create table if not exists player_types
(
    id smallint not null primary key,
    name text not null
);

insert into player_types (id, name) select 1, 'pending approval' where not exists (select * from player_types where id = 1);
insert into player_types (id, name) select 2, 'invited' where not exists (select * from player_types where id = 2);
insert into player_types (id, name) select 3, 'active' where not exists (select * from player_types where id = 3);
insert into player_types (id, name) select 4, 'admin' where not exists (select * from player_types where id = 4);

create table if not exists affiliations
(
    id serial not null primary key,
    name varchar(100) not null
);

create table if not exists players
(
    id serial not null primary key,
    player_type_id smallint not null references player_types (id) default 1,
    created_date timestamp with time zone not null,
    name text not null,
    email text unique,
    rating int not null default 0,
    affiliation_id int references affiliations (id),
    image_url text,
    bio text,
    google_id text unique,
    google_profile json
);

create table if not exists sessions
(
   token character(64) not null primary key,
   player_id integer not null references players (id) on delete cascade,
   created_date timestamp with time zone NOT NULL,
   last_activity_date timestamp with time zone NOT NULL
);

create table if not exists game_types
(
    id smallint not null primary key,
    name varchar(100) not null
);

insert into game_types (id, name) select 1, 'Singles' where not exists (select * from game_types where id = 1);
insert into game_types (id, name) select 2, 'Doubles' where not exists (select * from game_types where id = 2);

create table if not exists matches
(
    id serial not null primary key
);

create table if not exists games
(
    id serial not null primary key,
    game_type_id smallint not null references game_types (id),
    created_date timestamp with time zone not null,
    created_by_player_id int not null references players (id),
    match_id int references matches (id)
);

create table if not exists games_players
(
    id serial not null primary key,
    game_id integer not null references games(id),
    player_id integer not null references players(id),
    is_winner boolean not null,
    score smallint not null
);