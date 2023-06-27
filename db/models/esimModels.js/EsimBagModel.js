module.exports = (sequelize, DataTypes) => {
	const EsimBag = sequelize.define('EsimBag', {
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
		title: DataTypes.STRING,
		provider: DataTypes.STRING,
	});

	EsimBag.associate = ({ Esim, ProductVariant }) => {
		EsimBag.hasMany(Esim);
		Esim.belongsTo(EsimBag);
		EsimBag.belongsToMany(ProductVariant, { through: 'EsimBagProductVariants' });
		ProductVariant.belongsToMany(EsimBag, { through: 'EsimBagProductVariants' });
	};

	EsimBag.loadScopes = () => {
		EsimBag.addScope('defaultScope', {
			order: [
				['createdAt', 'DESC'],
				['provider', 'ASC'],
				['title', 'ASC'],
			],
		});
	};

	return EsimBag;
};
