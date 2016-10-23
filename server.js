const AlexaAppServer = require('alexa-app-server');

AlexaAppServer.start({
  // Path to root
  server_root: __dirname,
  // Static content
  public_html: "public_html",
  // Where alexa-app modules are stored
  app_dir: "src",
  // Service root
  app_root: "/alexa/",
  // What port to use, duh
  port: 3000,
});
