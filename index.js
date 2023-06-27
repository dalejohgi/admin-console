require("dotenv").config();
const readline = require("readline");
const db = require("./db");
const chalk = require("chalk");
const holaflyHex = chalk.hex("#e6485c");

async function main() {
	try {
		// Conexión a la base de datos
		//await sequelize.authenticate();
		console.log(chalk.white("\n----------------------------------------"));
		console.log(holaflyHex("Bienvenid@ a la consola Holafly Admin."));
		console.log(chalk.white("----------------------------------------"));
		const processOptions = ["Cargar productos a una bolsa", "Salir"];
		const booleanOpt = ["Si", "No"];

		let chosedProcess = await createPrompt(
			processOptions,
			"Que deseas hacer?"
		);

		while (chosedProcess !== 2) {
			switch (chosedProcess) {
				// Cargar productos a una bolsa
				case 1:
					const bagNamePattern = await prompt(
						holaflyHex(
							"Ingrese el patron de nombres de las bolsas a cargar: "
						)
					);
					const bags = await db.EsimBag.findAll({
						attributes: ["id", "title"],
						where: {
							title: {
								[db.Sequelize.Op.like]: `%${bagNamePattern}%`,
							},
						},
						raw: true,
					});

					if (bags.length) {
						const bagsIds = bags.map((bag) => {
							return JSON.stringify(bag.id);
						});
						let threeAustriaCount = await db.esimVault.query(
							`SELECT COUNT(*) FROM holafly_customers.ThreeAustriaIccidMsisdn taim
								WHERE taim.ICCID IN (
									SELECT e.iccid FROM holafly_esimvault.Esims e
										WHERE e.EsimBagId IN (${bagsIds}));`,
							{ type: db.esimVault.QueryTypes.SELECT }
						);
						threeAustriaCount = threeAustriaCount[0]["COUNT(*)"];

						if (threeAustriaCount !== 500 * bags.length) {
							console.log(
								chalk.magenta(
									"\nADVERTENCIA!\nLa cantidad de esims en stock NO coincide con los registros de 3ausMsisdnIccid, es posible que el proceso de recarga haya fallado"
								)
							);
							const warningConfirmation = await createPrompt(
								booleanOpt,
								holaflyHex("Desea continuar igualmente?")
							);
							if (warningConfirmation === 2) {
								return;
							}
						}
						const product = await prompt(
							holaflyHex(
								"Ingrese el producto a cargar (ej: x dias y datos ilimitados): "
							)
						);
						const variantsString = await prompt(
							holaflyHex(
								"Ingrese las variantes separadas por comas sin esspacios: "
							)
						);
						const variants = variantsString
							.split(",")
							.map((variant) => JSON.stringify(variant));

						// Lanzar confirmacion con datos ingresados
						console.log(
							chalk.cyan(
								`Estas a punto de cargar ${bags.length} bolsa(s) con ${product} para las ${variants.length} variantes:\n${variants}`
							)
						);
						const confirmationToTriggerBagLoad = await createPrompt(
							booleanOpt,
							`Deseas continuar?  `
						);
						// Carga
						if (confirmationToTriggerBagLoad === 1) {
							console.log(
								holaflyHex("CARGANDO PRODUCTOS Y VARIANTES...")
							);

							processedBags = 0;
							for (bag of bags) {
								try {
									const result = await db.esimVault
										.query(`INSERT INTO EsimBagProductVariants (EsimBagId, ProductVariantId , createdAt, updatedAt)
										select ${bag.id}, pv.id, NOW(), NOW()
										from ProductVariants pv 
										where pv.title = '${product}' and pv.product_title in (${variants}) and pv.deletedAt is NULL;`);

									console.log(
										chalk.green(
											`${bag.title} cargada con ${result.length}  productos.`
										)
									);

									const result = await db.esimVault
										.query(`INSERT INTO ProductVariantEsims (ProductVariantId, EsimId, createdAt, updatedAt)
										SELECT pv.id, e.id, NOW(), NOW()
										FROM ProductVariants pv, Esims e
										WHERE e.EsimBagId = ${bag.id} and pv.id in (
										SELECT pv2.id from ProductVariants pv2 where pv2.title = '${product}' and pv2.product_title in (${variants}) and pv.deletedAt is NULL;`);

									console.log(
										chalk.green(
											`${bag.title} cargada con ${result.length}  variantes.`
										)
									);
								} catch (error) {
									console.log(
										chalk.red(
											`ERROR en la carga de productos de la bolsa ${bag.title}!!\n`,
											error
										)
									);
									return;
								}
								console.log(chalk.cyan('El proceso de carga ha terminado con exito!'))
							}
						} else {
							console.log(holaflyHex("Carga cancelada..."));
						}
					} else {
						console.log(
							chalk.red(
								"No existen bolsas con este patron de nombre."
							)
						);
					}
					break;

				default:
					console.log(chalk.red("Opción inválida."));
					break;
			}

			chosedProcess = await createPrompt(
				processOptions,
				"Que deseas hacer?"
			);
		}

		// Cerrar la conexión a la base de datos
		//await sequelize.close();
		console.log(holaflyHex("¡Hasta luego!"));
	} catch (error) {
		console.error(
			chalk.red("Error al conectar a la base de datos:"),
			error
		);
	}
}

// Función auxiliar para obtener entrada desde la consola
function prompt(question) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
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
		output: process.stdout,
	});

	const formattedOptions = options
		.map((option, index) => `${index + 1}. ${option}`)
		.join("\n");

	return new Promise((resolve) => {
		rl.question(
			holaflyHex(`\n${question}\n`) + `${formattedOptions}\n`,
			(answer) => {
				rl.close();
				const selectedOption = parseInt(answer);
				resolve(selectedOption);
			}
		);
	});
}

// Ejecutar la función principal
main();
