const app = require('./src/app');

const PORT = process.env.PORT || 3005;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`query-visualization corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
