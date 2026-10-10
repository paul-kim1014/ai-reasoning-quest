ALTER TABLE profiles ADD rating integer DEFAULT 1000 NOT NULL;
--> statement-breakpoint
ALTER TABLE profiles ADD wins integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE profiles ADD losses integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE TABLE battles (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  user_id text NOT NULL,
  opponent_handle text NOT NULL,
  result text NOT NULL,
  rating_delta integer NOT NULL,
  tactic text NOT NULL,
  created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
