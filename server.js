const { graphql } = require("graphql");
const { promisify } = require("bluebird");
const Schema = require("./Schema");

async function graphQLHandler(request, reply) {
  const { query, variables = {} } = request.payload;
  const result = await graphql(
    Schema,
    query,
    {
      db: request.db,
      userId: "1"
    },
    variables
  );
  return reply(result);
}

export default async function runServer() {
  try {
    const server = new Hapi.Server();

    // Make server methods promise friendly
    for (const method of ["register", "start"]) {
      server[method] = promisify(server[method], server);
    }

    server.connection({
      host: "localhost",
      port: "3002"
    });

    server.route({
      method: "POST",
      path: "/",
      handler: graphQLHandler
    });

    await server.start();

    console.log("Server started at " + server.info.uri);
  } catch (e) {
    console.log(e);
  }
}
