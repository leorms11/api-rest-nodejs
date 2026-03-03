import type { FastifyReply } from "fastify/types/reply.js";
import type { FastifyRequest } from "fastify/types/request.js";

export async function validateSessionIdExists(request: FastifyRequest, reply: FastifyReply) {
	const { sessionId } = request.cookies;

	if (!sessionId) {
		return reply.status(401).send({ error: "Unauthorized" });
	}
}