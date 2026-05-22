const app = require('./src/app');

const PORT = process.env.PORT || 3003;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`tracking-reminders corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
