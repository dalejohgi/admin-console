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
		console.log(holaflyHex("Bienvenid@ a la consola Holafly!"));
		console.log(chalk.white("----------------------------------------"));
		const processOptions = ["Cargar productos a una bolsa", "Desasignar productos de una bolsa", "Salir"];
		const booleanOpt = ["Si", "No"];

		let chosedProcess = await createPrompt(
			processOptions,
			"Que deseas hacer?"
		);

		while (chosedProcess !== 3) {
			switch (chosedProcess) {
				// Cargar productos a una bolsa
				case 1:
					const bagNamePattern = await prompt(
						holaflyHex(
							"Ingresa el patron de nombres de las bolsas a cargar: "
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
						console.log(
							chalk.cyan(
								`Se encontraron ${bags.length} bolsas con este patron.`
							)
						);
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
									"\nADVERTENCIA!\nLa cantidad de esims en stock NO coincide con las esims recargada, es posible que el proceso de recarga haya fallado. Contacta al equipo TECH antes de continuar!"
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
								"Ingresa la variante a cargar (ej: x dias y datos ilimitados): "
							)
						);
						const variantsString = await prompt(
							holaflyHex(
								"Ahora ingresa los productos separados por comas y sin espacios: "
							)
						);
						const variants = variantsString
							.split(",")
							.map((variant) => JSON.stringify(variant));

						// Lanzar confirmacion con datos ingresados
						console.log(
							chalk.cyan(
								`Estas a punto de cargar ${bags.length} bolsa(s) con ${product} para los ${variants.length} productos:\n${variants}`
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
							for (let bag of bags) {
								try {
									const EsimBagProductVariantsResult =
										await db.esimVault.query(
											`INSERT INTO EsimBagProductVariants (EsimBagId, ProductVariantId , createdAt, updatedAt) select '${bag.id}', pv.id, NOW(), NOW() from ProductVariants pv where pv.title = '${product}' and pv.product_title in (${variants}) and pv.deletedAt is NULL;`
										);

									const productVariantEsimsResult = await db.esimVault.query(
											`INSERT INTO ProductVariantEsims (ProductVariantId, EsimId, createdAt, updatedAt) SELECT pv.id, e.id, NOW(), NOW() FROM ProductVariants pv, Esims e WHERE e.EsimBagId = '${bag.id}' and pv.id in ( SELECT pv2.id from ProductVariants pv2 where pv2.title = '${product}' and pv2.product_title in (${variants}) and pv.deletedAt is NULL);`
										);

									console.log(
										chalk.green(
											`${bag.title} cargada con ${EsimBagProductVariantsResult[1]} productos ------ ${productVariantEsimsResult[1]} productVariantsEsims.`
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
							}
							console.log(
								chalk.cyan(
									"El proceso de carga ha terminado con exito!"
								)
							);
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
				
				case 2:
					// desasignar productos a una bolsa
					const bagName = await prompt(
						holaflyHex(
							"Ingrese el nombre de las bolsa a la que desea remover los productos: "
						)
					);
					const bag = await db.EsimBag.findOne({
						attributes: ["id", "title"],
						where: {
							title: bagName,
						},
						raw: true,
					});

					if (bag) {
						const bagId = bag.id;
						console.log(
							chalk.cyan(
								`Se encontró la bolsa ${bag.title}`
							)
						);

						const product = await prompt(
							holaflyHex(
								"Ingresa la variante a eliminar (ej: x dias y datos ilimitados): "
							)
						);
						const variantsString = await prompt(
							holaflyHex(
								"Ingresa los productos de está variate que deseas remover separados por comas sin espacios: "
							)
						);
						const variants = variantsString
							.split(",")
							.map((variant) => JSON.stringify(variant));

						// Lanzar confirmacion con datos ingresados
						console.log(
							chalk.cyan(
								`Estas a punto de eliminar la variante "${product}" en ${variants} asociada a la bolsa ${bag.title}`
							)
						);
						const confirmationToTriggerBagLoad = await createPrompt(
							booleanOpt,
							`Deseas continuar?  `
						);
						// Carga
						if (confirmationToTriggerBagLoad === 1) {
							console.log(
								holaflyHex("ELIMINANDO PRODUCTOS...")
							);

							
							try {
								const EsimBagProductVariantsResult =
									await db.esimVault.query(`
										DELETE ebpv FROM EsimBagProductVariants ebpv WHERE EsimBagId = '${bagId}' AND ProductVariantId IN (
											SELECT pv.id FROM ProductVariants pv WHERE pv.id = ebpv.ProductVariantId AND pv.title = '${product}'
											AND pv.product_title IN (${variants}));`
									);

								const productVariantEsimsResult =
									await db.esimVault.query(`DELETE pve FROM ProductVariantEsims pve
									WHERE ProductVariantId IN (
										SELECT pv.id
										FROM ProductVariants pv
										WHERE pv.title = '${product}'
										AND pv.product_title IN (${variants})
										AND pv.deletedAt IS NULL
									)
									AND EsimId IN (
										SELECT e.id
										FROM Esims e
										WHERE e.EsimBagId = '${bagId}'
									);`);
								console.log(
									chalk.green(
										`Se han eliminado ${EsimBagProductVariantsResult[0].affectedRows} productVariants, ${productVariantEsimsResult[0].affectedRows} productVariantsEsims de la bolsa ${bag.title}`
									)
								);
							} catch (error) {
								console.log(
									chalk.red(
										`ERROR eliminado productos de la bolsa ${bag.title}!!\n`,
										error
									)
								);
								return;
							}
							
							console.log(
								chalk.cyan(
									"El proceso de eliminacion de productos ha terminado con exito!"
								)
							);
						} else {
							console.log(holaflyHex("Eliminacion de productos cancelada..."));
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
