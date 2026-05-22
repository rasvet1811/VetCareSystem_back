const app = require('./src/app');

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`user-management corriendo en http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api/docs`);
  });
}

module.exports = app;
