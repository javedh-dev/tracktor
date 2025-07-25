import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface AuthAttributes {
    id: number;
    hash: string;
}

interface AuthCreationAttributes extends Optional<AuthAttributes, 'id'> {}

class Auth extends Model<AuthAttributes, AuthCreationAttributes> implements AuthAttributes {
    public declare id: number;
    public declare hash: string;
}

Auth.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'auth',
    timestamps: true,
    underscored: true,
    sequelize,
});

export default Auth;