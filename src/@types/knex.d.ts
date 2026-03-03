// eslint-disable-next-line
import knex from "knex";

declare module "knex/types/tables" {
  interface Tables {
    transactions: {
      id: string;
      title: string;
      amount: number;
      session_id: string;
      created_at: Date;
      session_id: string;
    };
  }
}

