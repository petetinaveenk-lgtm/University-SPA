const app = require('./app');
const { PORT } = require('./config/config');
const { initializeDataFiles } = require('./utils/fileStorage');

async function startServer() {
  try {
    // Ensure all data files and folders exist safely
    await initializeDataFiles();
    console.log('[Database] JSON Data files verified and ready.');

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` University Management REST API Server Running `);
      console.log(` Port:    http://localhost:${PORT}`);
      console.log(` Base API: http://localhost:${PORT}/api`);
      console.log(` Health:  http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error.message);
    process.exit(1);
  }
}

startServer();
