import { MongoClient } from "mongodb";

const url = "mongodb://mongo:27017";
const mongo_client = new MongoClient(url);

export class DatabaseWorker {
  private db;
  private dbName;
  constructor(dbName) {
    this.dbName = dbName;
  }

  async connect() {
    // Use connect method to connect to the server
    await mongo_client.connect();
    this.db = mongo_client.db(this.dbName);
    console.log("Connected successfully to Mongo DB");
    // collection = db.collection('1d');

    // the following code examples can be pasted here...
    return this.db;
  }

  async getOneFromCollection(collection, filter) {
    return this.db.collection(collection).findOne(filter);
  }

  async getAllSymbolsKlines(timeframe) {
    const coll = this.db.collection(timeframe);
    const res = await coll.find();
    return res;
  }

  async getSignals() {
    const isMacdSignal = (signal) => {
      const totalLength = signal.time_.length;

      if (signal.macdUp[signal.macdUp.length - 1] >= totalLength - 2)
        return true;
      else return false;
    };

    const isSmaSignal = (signal) => {
      const totalLength = signal.time_.length;
      if (signal.sma[totalLength - 1] === "positive") return true;
      else return false;
    };

    const signals = {};
    const coll1d = this.db.collection("1d");
    const signals1d = await coll1d
      .find({
        "signals.lastUpdate": {
          $gte: new Date()
        }
      })
      .toArray();

    for (const signal of signals1d) {
      signals[signal._id] = {
        "1d": {
          macd: isMacdSignal(signal.signals),
          sma: isSmaSignal(signal.signals)
        }
      };
    }

    const coll4h = this.db.collection("4h");
    const signals4h = await coll4h
      .find({
        "signals.lastUpdate": {
          $gte: new Date()
        }
      })
      .toArray();
    for (const signal of signals4h) {
      signals[signal._id] = {
        ...signals[signal._id],
        "4h": {
          macd: isMacdSignal(signal.signals),
          sma: isSmaSignal(signal.signals)
        }
      };
    }

    return signals;
  }
}
