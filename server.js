const app = require('./api/index'); // your express app
const port = 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
