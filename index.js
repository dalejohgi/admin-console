require('dotenv').config();
const readline = require('readline');
const chalk = require('chalk');
const holaflyHex = chalk.hex('#e6485c');

// Configuración de la conexión a la base de datos
console.log( DBHOST, DBNAME, DBPASS, DBUSER)












async function main() {
  try {
    // Conexión a la base de datos
    //await sequelize.authenticate();
    console.log(chalk.white('\n----------------------------------------'));
    console.log(holaflyHex('Bienvenid@ a la consola Holafly Admin.'));
    console.log(chalk.white('----------------------------------------'));
    const processOptions = ['Cargar productos a una bolsa', 'Salir'];
    const booleanOpt = ['Si', 'No'];


    let chosedProcess = await createPrompt(processOptions, 'Que deseas hacer?');

    while (chosedProcess !== 2) {
      switch (chosedProcess) {
        // Cargar productos a una bolsa
        case 1:
          const bagNamePattern = await prompt(holaflyHex('Ingrese el patron de nombres de las bolsas a cargar: '));
          const bags = await EsimBag.findAll({
            attributes: ['id', 'title'],
            where: {
              title: {
                [Sequelize.Op.like]: `%${bagNamePattern}%`
              }
            },raw : true
          });
          if (bags.length) {
            const product = await prompt(holaflyHex('Ingrese el producto a cargar (ej: x dias y datos ilimitados): '));
            const destinationsString = await prompt(holaflyHex('Ingrese los destinos separados por comas: '));
            const destinations = destinationsString.split(',');
            
            // Lanzar confirmacion con datos ingresados
            const confirmationMessage = `Estas a punto de cargar ${bags.length} bolsa(s) con ${product} para los ${destinations.length} destinos:\n\n${destinations}\n\nDeseas continuar?  `
            const confirmationToTriggerBagLoad = await createPrompt(booleanOpt, confirmationMessage);
            if (confirmationToTriggerBagLoad  === 1) {
                console.log(holaflyHex('CARGANDO...'))

                console.log(chalk.green('Se encontraron las siguientes bolsas: '), bags)//, registro.toJSON());

            } else {
                console.log(holaflyHex('Carga cancelada...'))
            }

          } else {
            console.log(chalk.red('No existen bolsas con este patron de nombre.'));
          }
          break;
      
        default:
          console.log(chalk.red('Opción inválida.'));
          break;
      }

      chosedProcess = await createPrompt(processOptions, 'Que deseas hacer?');
    }

    // Cerrar la conexión a la base de datos
    //await sequelize.close();
    console.log(holaflyHex('¡Hasta luego!'));
  } catch (error) {
    console.error(chalk.red('Error al conectar a la base de datos:'), error);
  }
}

// Función auxiliar para obtener entrada desde la consola
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Función auxiliar para obtener entrada desde la consola
function createPrompt(options, question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    const formattedOptions = options.map((option, index) => `${index + 1}. ${option}`).join('\n');
  
    return new Promise((resolve) => {
      rl.question(holaflyHex(`\n${question}\n`) + `${formattedOptions}\n`, (answer) => {
        rl.close();
        const selectedOption = parseInt(answer);
        resolve(selectedOption);
      });
    });
  }

// Ejecutar la función principal
main();
