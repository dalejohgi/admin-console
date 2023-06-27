module.exports = (sequelize, DataTypes) => {
	const ProductVariant = sequelize.define(
		'ProductVariant',
		{
			id: { type: DataTypes.BIGINT, primaryKey: true, autoincrement: false },
			title: DataTypes.STRING,
			product_id: DataTypes.BIGINT,
			product_title: DataTypes.STRING,
			name: {
				type: DataTypes.VIRTUAL,
				get() {
					return `${this.getDataValue('product_title')} - ${this.getDataValue('title')}`.trim();
				},
			},
		},
		{
			tableName: 'ProductVariants',
			paranoid: true,
		}
	);

	ProductVariant.associate = ({ Esim }) => {
		ProductVariant.belongsToMany(Esim, { through: 'ProductVariantEsims' });
		Esim.belongsToMany(ProductVariant, { through: 'ProductVariantEsims' });
	};

	return ProductVariant;
};
