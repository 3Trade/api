// Importing node.js file system module
import fs from "fs";
import { getSymbols } from "../utils/binance.js";
import { MongoClient } from "mongodb";
import { connect } from "http2";

// Connection URL
const url = "mongodb://mongo:27017";
const mongo_client = new MongoClient(url);

async function connectMongo() {
  // Use connect method to connect to the server
  await mongo_client.connect();
  console.log("Connected successfully to server");
  const db = mongo_client.db("indicators");
  const collection = db.collection("4h");

  // the following code examples can be pasted here...

  return "done.";
}

export class DBWorker {
  private db;
  private dbName;
  constructor(dbName) {
    this.dbName = dbName;
    this.connect();
  }

  async connect() {
    // Use connect method to connect to the server
    await mongo_client.connect();
    console.log("Connected successfully to Mongo DB");
    this.db = mongo_client.db(this.dbName);
    // collection = db.collection('1d');

    // the following code examples can be pasted here...
    return "done.";
  }

  // static async writeToFile(folder, filename, content) {
  // 	try{
  // 		await fs.writeFileSync(new URL(`./data/${folder}/${filename}`, import.meta.url), JSON.stringify(content, null, 2))
  // 	} catch {
  // 		await fs.mkdirSync(new URL(`./data/${folder}`, import.meta.url), { recursive: true })
  // 		await fs.writeFileSync(new URL(`./data/${folder}/${filename}`, import.meta.url), JSON.stringify(content, null, 2))

  // 	}
  // }

  // static async writeCandles(quote, pair, candles) {
  // 	try{
  // 		await fs.writeFileSync(new URL(`./data/${quote}/${pair}.json`, import.meta.url), JSON.stringify(candles, null, 2))
  // 	} catch {
  // 		await fs.mkdirSync(new URL(`./data/${quote}`, import.meta.url), { recursive: true })
  // 		await fs.writeFileSync(new URL(`./data/${quote}/${pair}.json`, import.meta.url), JSON.stringify(candles, null, 2))
  // 	}
  // }

  // static async getPairsFromQuote(asset) {
  // 	try {
  // 		fs.accessSync(new URL(`./data/symbols.json`, import.meta.url))
  // 	} catch (err) {
  // 		// await fs.writeFileSync(new URL(`./data/symbols.json`, import.meta.url), '')
  // 		const symbols = await getSymbols()
  // 		await this.writeToFile(".", "symbols.json", symbols)
  // 		return symbols.filter(pair=> pair.endsWith(asset))

  // 	}
  // 	const allPairs = JSON.parse(await fs.readFileSync(new URL(`./data/symbols.json`, import.meta.url), 'utf8'))
  // 	return allPairs.filter(pair=> pair.endsWith(asset))
  // }

  async getSymbols(timeframe) {
    const res = await this.db.collection(timeframe).distinct("_id", {}, {});
    return res;
  }

  async getCandles(symbol, timeframe) {
    let query = { _id: symbol };
    const res = await this.db.collection(timeframe).findOne(query);
    return res.candles;
  }

  async getMacd(symbol, timeframe) {
    let query = { _id: symbol };

    const resp = await this.db.collection(timeframe).findOne(query);

    return resp.indicators.macd;
  }

  async getSMA(symbol, timeframe) {
    let query = { _id: symbol };
    const resp = await this.db.collection(timeframe).findOne(query);

    return resp.indicators;
  }
}

export default DBWorker;
