// import { Series } from "danfojs-node";
import db, { DBWorker } from "../db/worker.js";
import { ArrayType1D } from "danfojs-node/dist/danfojs-base/shared/types.js";

import { MainClient, KlineInterval } from "binance";
import { Series } from "danfojs-node";

const binanceClient = new MainClient({
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET
});

export default binanceClient;

const dbWorker = new DBWorker("indicators");

export const getSymbols = async (timeframe) => {
  const symbols = await dbWorker.getSymbols(timeframe);
  return symbols;
  // let ticker = await binance.prices();
  // return Object.keys(ticker)
};

export const getCandles = async (symbol, timeframe) => {
  const candles = await dbWorker.getCandles(symbol, timeframe);
  // console.log("Candles", symbol, timframe, candles);
  return await new Promise(function (resolve, reject) {
    resolve(candles);
    //   binance.candlesticks(symbol, "4h", (error, ticks, symbol) => {
    //   try {
    //     const response = ticks.map(t=> {
    //       let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = t;
    //       return {time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored}
    //     })
    //     if (response) {
    //       resolve(candles);
    //     }
    //     else {
    //       reject(Error("It broke"));
    //     }

    //   } catch {
    //     reject(Error("Request error"));
    //   }
    // })
  });
};

export const getMacd = async (symbol, timeframe) => {
  const macd = await dbWorker.getMacd(symbol, timeframe);
  return macd;

  // return await new Promise(function (resolve, reject) {
  //   let time = [];
  //   let close = [];
  //   const macd = dbWorker.getMacd(symbol, timeframe);
  //   console.log("DBBBB MACD", macd);

  //   resolve(macd);
  //   //   binance.candlesticks(symbol, timeframe, (error, ticks, symbol) => {
  //   //     ticks.map(t=> {
  //   //       time.push(new Date(t[0]).toLocaleString());
  //   //       close.push(t[4]);
  //   //       // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = t;
  //   //       return t
  //   //   })
  //   //   if (time.length > 2 ) {
  //   //     const output_cut = tulind.indicators.macd.start([12,26,9])
  //   //     tulind.indicators.macd.indicator([close], [12,26,9], function(err, results) {
  //   //       resolve({time: time, macd: results[0], macd_signal: results[1], macd_histogram: results[2], output_cut});
  //   //     });
  //   //   }
  //   //   else {
  //   //     reject(Error("It broke"));
  //   //   }
  //   // })
  // });
};

export const getSMA = async (symbol, timeframe) => {
  console.log("GETTING SMA", symbol, timeframe);
  const resp = await dbWorker.getSMA(symbol, timeframe);
  console.log("SSSSSSS", resp);

  return resp;
};

export const getMacdCross = async (symbol, timeframe) => {
  const macd_data: any = await getMacd(symbol, timeframe);
  const histogram_df = new Series(macd_data.macd_histogram);
  const lower_start = histogram_df
    .iloc([`0:${histogram_df.shape[0] - 1}`])
    .lt(0);
  const higher_start = histogram_df.iloc([`1:`]).gt(0);
  const logical_product = lower_start.and(higher_start);
  const times = new Series(macd_data.time);
  const logical_idx = logical_product.values;
  logical_idx.unshift(...new Array(macd_data.output_cut + 2).fill(false));
  const cross_times = times.loc(logical_idx as ArrayType1D);
  return cross_times.values;
};

export const getMacdCross_lastN = async (symbol, timeframe, n) => {
  const macd_data: any = await getMacd(symbol, timeframe);

  if (
    new Date(macd_data.time[macd_data.time.length - 1]).setHours(0, 0, 0, 0) <
    new Date().setHours(0, 0, 0, 0)
  )
    return [];
  // console.log("SLICED", macd_data.macd_histogram.slice(-n));
  const histogram_df = new Series(macd_data.macd_histogram.slice(-(n + 1)));
  // console.log("HISTOGRAM", histogram_df.values);
  const lower_start = histogram_df
    .iloc([`0:${histogram_df.shape[0] - 1}`])
    .lt(0);
  // console.log("LOWER", lower_start.values);
  const higher_start = histogram_df.iloc([`1:`]).gt(0);
  // console.log("HIGHER", higher_start.values);
  const logical_product = lower_start.and(higher_start);
  const times = new Series(macd_data.time.slice(-(n + 1)));
  // console.log("LOGICAL", logical_product);
  // console.log("TIMES", times.values);
  const logical_idx = logical_product.values;
  // if(!logical_idx.includes(true)) return
  // console.log("IDX", symbol, logical_idx);
  // logical_idx.unshift(...new Array(macd_data.output_cut + 2).fill(false))
  logical_idx.unshift(...new Array(1).fill(false));

  const cross_times = times.loc(logical_idx as ArrayType1D);
  console.log("CROSS TIMES", cross_times.values);
  return cross_times.values;
};
