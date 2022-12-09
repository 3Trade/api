import express from "express";
import binance from "./utils/binance.js";
import { DatabaseWorker } from "./workers/database";
// import {Re} from "./workers/redisWorker"
import { channel } from "./index.js";
import { TransportWorker } from "./workers/transport-worker/transport-worker.js";
import { RedisWorker } from "./workers/redisWorker.js";
// import { RedisWorker } from "./workers/redisWorker.js";

const router = express.Router();
const ticker = async (req, res) => {
  console.log("Ticker callback");
  let ticker = await binance.get24hrChangeStatististics();

  //   await dbWorker.writeToFile("ticker", JSON.stringify(ticker, null, 2));
  res.json(ticker);
};

// const candlesticks = async (req, res) => {
//   console.log("Candlestick callback");
//   const response = await getCandles(req.params.symbol, req.params.timeframe);
//   res.json({ response });
// };

// const symbols = async (req, res) => {
//   console.log("Symbols callback");
//   const response = await getSymbols(req.params.timeframe);
//   res.json({ response });
// };

// const macd_cross = async (req, res) => {
//   console.log("MACD Cross callback");
//   const response = await getMacdCross(req.params.symbol, req.params.timeframe);
//   res.json({ response });
// };

// const symbols_crosses = async (req, res) => {
//   console.log("Getting all the symbols");
//   const symbols = await getSymbols(req.params.timeframe);
//   console.log("Fetched symbols", symbols);
//   const timeframe = req.params.timeframe;
//   const cross_dict = {};
//   for (let s of symbols) {
//     const response = await getMacdCross_lastN(s, timeframe, 1);
//     if (response.length == 0) continue;
//     else cross_dict[s] = response;
//     // const sma: any = await getSMA(s, timeframe);
//     // const sma_1d: any = await getSMA(s, "1d");
//     // const candles: any = await getCandles(s, timeframe);
//     // const last_price = candles[candles.length - 1][4];
//     // if (
//     //   last_price > sma[sma.length - 1] &&
//     //   last_price > sma_1d[sma_1d.length - 1]
//     // )
//     //   cross_dict[s] = response;
//     // // if(last_price > sma[sma.length - 1]) cross_dict[s] = response
//     // else continue;
//   }
//   res.json({ response: cross_dict });
// };

// const macd_ma = async (req, res) => {
//   const symbols = await getSymbols(req.params.timeframe);
//   const timeframe = req.params.timeframe;
//   const cross_dict = {};
//   for (let s of symbols) {
//     const response = await signal_macd_ma(s, timeframe, 1);
//     if (response.length == 0) continue;
//     cross_dict[s] = response;
//   }
//   res.json({ response: cross_dict });
// };

// const getPairsFromQuote = async (req, res) => {
//   const assetPairs = await dbWorker.getPairsFromQuote(req.params.asset);
//   res.json({ response: assetPairs });
// };

// const writeAssetPairsCandles = async (req, res) => {
//   const assetPairs = await dbWorker.getAssetPairs(req.params.asset);
//   for (let pair of assetPairs) {
//     const candles = await getCandles(pair, "1d");
//     await dbWorker.writeToFile(req.params.asset, `${pair}.json`, candles);
//   }

//   res.json({ response: assetPairs });
// };

const atualizeDatabase = async (req, res) => {
  channel.sendToQueue(
    "klines",
    Buffer.from(JSON.stringify({ timeframe: req.params.timeframe }))
  );
  res.json({ response: "Ok" });
};

// const systemStatus = async (req, res) => {
//   const redis = new RedisWorker();
//   const lastDatabaseUpdate = await redis.getLastDatabaseUpdate();
//   res.json({
//     response: {
//       lastDatabaseUpdate
//     }
//   });
// };

const status = async (req, res) => {
  res.json({
    response: {
      status: "OK"
    }
  });
};

const reproccessIndicators = async (req, res) => {
  const databaseWorker = new DatabaseWorker("klines");
  const transportWorker = new TransportWorker();
  await databaseWorker.connect();
  await transportWorker.connect();
  const timeframe = req.params.timeframe;
  const allSymbolsKlines = await databaseWorker.getAllSymbolsKlines(timeframe);

  allSymbolsKlines.forEach((element) => {
    const pair = element._id;
    const klines = element.klines;
    console.log("Sending to indicators queue", pair, timeframe);

    transportWorker.sendToQueue("indicators", { pair, timeframe, klines });
  });

  res.json({
    response: {
      resp: allSymbolsKlines
    }
  });
};

const signals = async (req, res) => {
  const databaseWorker = new DatabaseWorker("signals");
  await databaseWorker.connect();

  const signals = await databaseWorker.getSignals();

  res.json({
    response: {
      signals
    }
  });
};

const getAdminData = async (req, res) => {
  const redisWorker = new RedisWorker();

  const update1d = await redisWorker.getLastDatabaseUpdate1d();
  const update4h = await redisWorker.getLastDatabaseUpdate4h();

  res.json({
    response: {
      updated1d: update1d,
      update4h: update4h
    }
  });
};

const backtest = async (req, res) => {
  const databaseWorker = new DatabaseWorker("indicators");
  await databaseWorker.connect();
  const resp = await databaseWorker.getOneFromCollection("4h", {
    _id: "ETHBTC"
  });

  const transportWorker = new TransportWorker();
  await transportWorker.connect();
  transportWorker.sendToQueue("signals", {
    pair: "ETHBTC",
    timeframe: "4h",
    ...resp.indicators
  });
  res.json("OK");
};

router.get("/status", status);
router.get("/signals", signals);
router.get("/admin", getAdminData);

// router.get("/:symbol/:timeframe", candlesticks);
// router.get("/:symbol/:timeframe/macd", macd);
router.get("/ticker", ticker);
router.get("/backtest", backtest);
// router.get("/symbols", symbols);
// router.get("/:symbol/:timeframe/macd_cross", macd_cross);
// router.get("/symbols/macd_cross/:timeframe", symbols_crosses);
// router.get("/worker/get_pairs_from_quote/:quote", getPairsFromQuote);
// router.get("/worker/write_data/:asset", writeAssetPairsCandles);
router.post("/worker/atualize_database/:timeframe", atualizeDatabase);
router.post("/worker/indicators/reproccess/:timeframe", reproccessIndicators);

export default router;
