import graphql from "graphql";

const { GraphQLObjectType, GraphQLString, GraphQLSchema } = graphql;

const SymbolType = new GraphQLObjectType({
  name: "Symbol",
  fields: {
    name: {
      type: GraphQLString
    },
    last_cross: {
      type: GraphQLString
    }
  }
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    symbol: {
      type: SymbolType,
      args: { timeframe: { type: GraphQLString } },
      resolve(parentValue, args) {
        return { name: "BTCEUR", last_cross: "2022" };
      }
    }
  }
});

export default new GraphQLSchema({
  query: RootQuery
});
