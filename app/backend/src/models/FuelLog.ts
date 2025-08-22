import { DataTypes, Model, Optional } from "sequelize";
import { db } from "@db/index.js";

interface FuelLogAttributes {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  fuelAmount: number;
  cost: number;
  notes?: string;
}

interface FuelLogCreationAttributes extends Optional<FuelLogAttributes, "id"> {}

class FuelLog
  extends Model<FuelLogAttributes, FuelLogCreationAttributes>
  implements FuelLogAttributes
{
  declare public id: string;
  declare public vehicleId: string;
  declare public date: string;
  declare public odometer: number;
  declare public fuelAmount: number;
  declare public cost: number;
  declare public notes?: string;
}

FuelLog.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    vehicleId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      references: {
        model: "vehicles",
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    odometer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "Odometer reading must be greater than 0.",
        },
      },
    },
    fuelAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "Fuel Amount must be greater than 0.",
        },
      },
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "Fuel Amount must be greater than 0.",
        },
      },
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Notes must be lesser than 500 length.",
        },
      },
    },
  },
  {
    tableName: "fuel_logs",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);
export default FuelLog;
