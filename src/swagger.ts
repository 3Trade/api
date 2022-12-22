export default {
  openapi: "3.0.0",
  info: {
    title: "ST API",
    version: "1.0.0",
    description: "ST API endpoints"
  },
  servers: [
    {
      url: "http://localhost:4000"
    }
  ],
  paths: {
    "/api/ticker": {
      get: {
        summary: "Ticker",
        description: "ticker",
        responses: {
          "200": {
            description: "Last prices"
          }
        }
      }
    },
    "/api/symbols": {
      get: {
        summary: "Symbols",
        description: "symbols",
        responses: {
          "200": {
            description: "All symbols"
          }
        }
      }
    },
    "/api/{symbol}/{timeframe}": {
      get: {
        summary: "Symbol",
        description: "symbol",
        parameters: [
          {
            name: "symbol",
            in: "path",
            description: "Symbol to fetch",
            required: true,
            type: "string"
          },
          {
            name: "timeframe",
            in: "path",
            description: "Timeframe to fetch",
            required: true,
            type: "string"
          }
        ],
        responses: {
          "200": {
            description: "Symbols"
          }
        }
      }
    },
    "/api/{symbol}/{timeframe}/macd": {
      get: {
        summary: "Symbol",
        description: "symbol",
        parameters: [
          {
            name: "symbol",
            in: "path",
            description: "Symbol to fetch",
            required: true,
            type: "string"
          },
          {
            name: "timeframe",
            in: "path",
            description: "Timeframe to fetch",
            required: true,
            type: "string"
          }
        ],
        responses: {
          "200": {
            description: "Macd"
          }
        }
      }
    },
    "/api/{symbol}/{timeframe}/macd_cross": {
      get: {
        summary: "Symbol",
        description: "symbol",
        parameters: [
          {
            name: "symbol",
            in: "path",
            description: "Symbol to fetch",
            required: true,
            type: "string"
          },
          {
            name: "timeframe",
            in: "path",
            description: "Timeframe to fetch",
            required: true,
            type: "string"
          }
        ],
        responses: {
          "200": {
            description: "Macd"
          }
        }
      }
    },
    "/api/symbols/macd_cross/{timeframe}": {
      get: {
        summary: "Symbol",
        description: "symbol",
        parameters: [
          {
            name: "timeframe",
            in: "path",
            description: "Timeframe to fetch",
            required: true,
            type: "string"
          }
        ],
        responses: {
          "200": {
            description: "Macd"
          }
        }
      }
    },
    "/api/worker/atualize_database/{timeframe}": {
      post: {
        summary: "Atualize database",
        description: "symbol",
        parameters: [
          {
            name: "timeframe",
            in: "path",
            description: "Timeframe to fetch",
            required: true,
            type: "string"
          }
        ],
        responses: {
          "200": {
            description: "Macd"
          }
        }
      }
    }
  }
};
