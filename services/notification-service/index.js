const app = require('./src/app');

const PORT = process.env.PORT || 3006;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`notification-service corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
