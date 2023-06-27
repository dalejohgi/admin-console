module.exports = (sequelize, DataTypes) => {
	const ThreeAustriaIccidMsisdn = sequelize.define(
		'ThreeAustriaIccidMsisdn',
		{
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            ICCID: { type: DataTypes.STRING, primaryKey: true},
            MSISDN: { type: DataTypes.STRING, primaryKey: true}
		},
		{
			tableName: 'ThreeAustriaIccidMsisdn',
			paranoid: true,
		}
	);

    return ThreeAustriaIccidMsisdn;
};