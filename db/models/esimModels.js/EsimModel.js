module.exports = (sequelize, { UUID, UUIDV4, STRING, TEXT, BOOLEAN, DATE, DATEONLY }) => {
	const Esim = sequelize.define(
		'Esim',
		{
			id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
			productId: STRING,
			variantId: STRING,
			orderId: STRING,
			orderNumber: STRING,
			cid: STRING,
			provider: STRING,
			imsi: STRING,
			iccid: STRING,
			msisdn: STRING,
			esiminfo: TEXT,
			code: STRING,
			status: STRING,
			efftime: {
				type: DATEONLY,
				defaultValue: new Date(),
			},
			exptime: {
				type: DATEONLY,
			},
			used: {
				type: BOOLEAN,
				defaultValue: false,
			},
			usedAt: {
				type: DATE,
			},
		},
		{
			paranoid: true,
		}
	);

	return Esim;
};