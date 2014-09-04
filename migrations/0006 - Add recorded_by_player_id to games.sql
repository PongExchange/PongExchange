TRUNCATE games_players, games RESTART IDENTITY;

ALTER TABLE games ADD COLUMN recorded_by_player_id int NOT NULL;