import { expect, it, beforeAll, afterAll, describe, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { knex } from "../src/database/database.js";

describe("Transactions API", () => {
	beforeAll(async () => {
		await app.ready();
	});
		
	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await knex.migrate.rollback();
		await knex.migrate.latest();
	});
		
		
	it("Should be able to create a new transaction", async () => {
		const response = await request(app.server).post("/transactions").send({
			title: "Nova transação",
			amount: 1000,
			type: "credit"
		});
		
		expect(response.status).toBe(201);
	});

	it("should be able to list all transactions", async () => {
		const createTransactionResponse = await request(app.server).post("/transactions").send({
			title: "Nova transação",
			amount: 1000,
			type: "credit"
		});

		const cookies = createTransactionResponse.get("Set-Cookie")  || [];

		const response = await request(app.server)
			.get("/transactions")
			.set("Cookie", cookies);
		
		expect(response.status).toBe(200);
		expect(response.body.transactions).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					title: "Nova transação",
					amount: 1000,
				})
			])
		);
	});

	it("should be able to get a specific transaction", async () => {
		const createTransactionResponse = await request(app.server).post("/transactions").send({
			title: "Nova transação",
			amount: 1000,
			type: "credit"
		});

		const cookies = createTransactionResponse.get("Set-Cookie")  || [];

		const listTransactionsResponse = await request(app.server)
			.get("/transactions")
			.set("Cookie", cookies);
		
		const transactionId = listTransactionsResponse.body.transactions[0].id;

		const response = await request(app.server)
			.get(`/transactions/${transactionId}`)
			.set("Cookie", cookies);
		
		expect(response.status).toBe(200);
		expect(response.body.transaction).toEqual(
			expect.objectContaining({
				title: "Nova transação",
				amount: 1000,
			})
		);
	});

	it("should be able to get the summary", async () => {
		const createTransactionResponse = await request(app.server).post("/transactions").send({
			title: "Nova transação",
			amount: 1000,
			type: "credit"
		});

		const cookies = createTransactionResponse.get("Set-Cookie")  || [];

		await request(app.server).post("/transactions")
			.set("Cookie", cookies)
			.send({
				title: "Nova transação 2",
				amount: 3000,
				type: "credit"
			});

		await request(app.server).post("/transactions")
			.set("Cookie", cookies)
			.send({
				title: "Nova transação 3",
				amount: 1500,
				type: "debit"
			});

		const response = await request(app.server)
			.get("/transactions/summary")
			.set("Cookie", cookies);
		
		expect(response.status).toBe(200);
		expect(response.body.summary).toEqual(
			expect.objectContaining({
				amount: 2500,
			})
		);
	});
});
