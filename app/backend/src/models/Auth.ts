import { DataTypes, Model, Optional } from "sequelize";
import { db } from "@db/index.js";

interface AuthAttributes {
  id: number;
  hash: string;
}

interface AuthCreationAttributes extends Optional<AuthAttributes, "id"> {}

class Auth
  extends Model<AuthAttributes, AuthCreationAttributes>
  implements AuthAttributes
{
  declare public id: number;
  declare public hash: string;
}

Auth.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "auth",
    timestamps: true,
    underscored: true,
    sequelize: db,
  },
);

export default Auth;
