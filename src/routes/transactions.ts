import type { FastifyInstance } from "fastify";
import { knex } from "../database/database.js";
import { z } from "zod";
import { validateSessionIdExists } from "../middlewares/validate-session-id-exists.js";

export async function transactionsRoutes(app: FastifyInstance) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// app.addHook("preHandler", async (request, reply) => {
	// 	console.log(`[${request.method}] ${request.url}`);
	// });

	app.get(
		"/",
		{ preHandler: validateSessionIdExists },
		async (request, reply) => {
			const { sessionId  } = request.cookies;

			const transactions = await knex("transactions")
				.select("*")
				.where({ session_id: sessionId });
		
			return reply.send({ transactions });
		});

	app.get(
		"/:id",
		{ preHandler: validateSessionIdExists },
		async (request, reply) => {
			const { sessionId  } = request.cookies;

			const getTransactionParamsSchema = z.object({
				id: z.uuid()
			});

			const { id } = getTransactionParamsSchema.parse(request.params);

			const transaction = await knex("transactions")
				.where({ id, session_id: sessionId })
				.first();

			if (!transaction) {
				return reply.status(404).send({ error: "Transaction not found" });
			}

			return reply.send({ transaction });
		});

	app.get(
		"/summary",
		{ preHandler: validateSessionIdExists },
		async (request, reply) => {
			const { sessionId  } = request.cookies;

			const summary = await knex("transactions")
				.where({ session_id: sessionId })
				.sum("amount", { as: "amount" })
				.first();

			return reply.send({ summary });
		});

	app.post("/", async (request, reply) => {
		const createTransactionBodySchema = z.object({
			title: z.string(),
			amount: z.number(),
			type: z.enum(["credit", "debit"])
		});

		const { title, amount, type } = createTransactionBodySchema
			.parse(request.body);

		let sessionId = request.cookies.sessionId;

		if (!sessionId) {
			sessionId = crypto.randomUUID();
			reply.setCookie("sessionId", sessionId, {
				maxAge: 60 * 60 * 24 * 7, // 7 days
				path: "/"
			});
		}

		await knex("transactions")
			.insert({
				id: crypto.randomUUID(),
				title,
				amount: type === "credit" ? amount : amount * -1,
				session_id: sessionId
			});

		return reply.status(201).send();
	});
}