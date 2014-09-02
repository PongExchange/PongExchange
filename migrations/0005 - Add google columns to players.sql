ALTER TABLE players ADD COLUMN google_id character varying(30);
ALTER TABLE players ADD COLUMN google_profile json;
ALTER TABLE players ADD UNIQUE (google_id);
ALTER TABLE players ADD UNIQUE (email);
