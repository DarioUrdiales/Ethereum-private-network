const app = require("./src/app")
const { exec } = require('child_process');

const PORT = 3000

const initBlockchain = () => {
  const command = 'cd ../nodos && docker-compose build && docker-compose up';

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el comando: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error en la salida estándar del comando: ${stderr}`);
      return;
    }

    console.log(`Salida estándar del comando:\n${stdout}`);
  });
};

const prueba = () => {
  const command = "cd ../nodos-2 && ./crear_red.sh 3 8000";

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el comando: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error en la salida estándar del comando: ${stderr}`);
      return;
    }

    console.log(`Salida estándar del comando:\n${stdout}`);
  });
}

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  // initBlockchain();
  // prueba();
})