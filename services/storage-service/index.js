const app = require('./src/app');

const PORT = process.env.PORT || 3004;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`storage-service corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
