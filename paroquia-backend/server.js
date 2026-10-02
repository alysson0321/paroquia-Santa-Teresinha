// Compatibilidade com o comando antigo usado por alguns serviços do Render.
// A implementação oficial agora está em src/server.js.
const app = require('./src/server');
const env = require('./src/config/env');
app.listen(env.port, () => console.log(`API da paróquia disponível na porta ${env.port}`));
