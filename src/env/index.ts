import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
	config({ path: ".env.test", override: true});
} else {
	config();
}

const envSchema = z.object({
	PORT: z.coerce.number().default(3333),
	NODE_ENV: z.enum(["test", "development", "production", "staging"]).default("production"),
	DATABASE_URL: z.string()
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
	console.error("Invalid environment variables:", _env.error.issues);
	throw new Error("⚠️ Invalid environment variables");
}

export default _env.data;