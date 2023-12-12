const app = require("./src/app")
const { exec } = require('child_process');

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`); // initBlockchain();
})
