import { connection } from "../database.js";

export interface Company {
  id: number;
  name: string;
  apiKey?: string;
}

export interface Business {
  id: number;
  name: string;
  type: string;
}

export async function findByApiKey(apiKey: string) {
  const result = await connection.query<Company, [string]>(
    `SELECT * FROM companies WHERE "apiKey"=$1`,
    [apiKey]
  );

  return result.rows[0];
}

export async function findById(id: number) {
  const result = await connection.query<Business, [number]>(
    `SELECT * FROM businesses WHERE id=$1`,
    [id]
  );

  return result.rows[0];
}
