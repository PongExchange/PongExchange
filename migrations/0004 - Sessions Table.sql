CREATE TABLE public.sessions
(
   token character(64) NOT NULL, 
   player_id integer NOT NULL,
   created_date timestamp with time zone NOT NULL,
   last_activity_date timestamp with time zone NOT NULL,
   PRIMARY KEY (token),
   FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE
);
