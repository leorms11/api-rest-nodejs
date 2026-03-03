import knexSetup from "knex";
import type { Knex } from "knex";
import env from "../env/index.js";

export const knexConfig: Knex.Config = {
	client: "sqlite3",
	connection: {
		filename: env.DATABASE_URL
	},
	useNullAsDefault: true,
	migrations: {
		extension: "ts",
		directory: "./src/database/migrations"
	}
};

export const knex = knexSetup(knexConfig);