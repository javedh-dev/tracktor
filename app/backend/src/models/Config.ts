import { DataTypes, Model, Optional } from "sequelize";
import { db } from "@db/index.js";

interface ConfigAttributes {
  key: string;
  value?: string;
  description?: string;
}

interface ConfigCreationAttributes extends Optional<ConfigAttributes, "key"> {}

class Config
  extends Model<ConfigAttributes, ConfigCreationAttributes>
  implements ConfigAttributes
{
  declare public key: string;
  declare public value: string;
  declare public description: string;
}

Config.init(
  {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "config",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

export default Config;
