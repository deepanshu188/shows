import { Database } from "bun:sqlite";

export const db = () => new Database("./Shows.db");
