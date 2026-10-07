CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`handle` text NOT NULL,
	`character` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`streak` integer DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_profiles_user_id` ON `profiles` (`user_id`);
--> statement-breakpoint
CREATE TABLE `completions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`quest_id` text NOT NULL,
	`xp_awarded` integer NOT NULL,
	`completed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_completions_user_quest` ON `completions` (`user_id`,`quest_id`);
