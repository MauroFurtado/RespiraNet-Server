// Middleware de CORS para permitir requisições do app mobile
function setupCORS(app) {
  app.use((req, res, next) => {
    // Permitir requisições de qualquer origem (pode ser ajustado para URLs específicas)
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Responder a preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  });
}

// Middleware de erro global
function setupErrorHandling(app) {
  app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
}

// Middleware de logging
function setupLogging(app) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

module.exports = {
  setupCORS,
  setupErrorHandling,
  setupLogging
};
