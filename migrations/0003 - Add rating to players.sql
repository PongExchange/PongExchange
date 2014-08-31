DO $$ 
    BEGIN
        BEGIN
            ALTER TABLE players ADD COLUMN rating int NOT NULL DEFAULT 0;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column rating already exists in players';
        END;
    END;
$$