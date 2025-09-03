import { DataTypes, Model, Optional } from "sequelize";
import { db } from "@db/index.js";
import Vehicle from "./Vehicle.js";

interface MaintenanceLogAttributes {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  serviceCenter: string;
  cost: number;
  notes?: string;
}

interface MaintenanceLogCreationAttributes
  extends Optional<MaintenanceLogAttributes, "id"> {}

class MaintenanceLog
  extends Model<MaintenanceLogAttributes, MaintenanceLogCreationAttributes>
  implements MaintenanceLogAttributes
{
  declare public id: string;
  declare public vehicleId: string;
  declare public date: string;
  declare public odometer: number;
  declare public serviceCenter: string;
  declare public cost: number;
  declare public notes: string;
}

MaintenanceLog.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    vehicleId: {
      type: DataTypes.UUIDV4,
      references: {
        model: "vehicles",
        key: "id",
      },
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          args: true,
          msg: "Date format is not correct",
        },
      },
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
    serviceCenter: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 50],
          msg: "Service Center must be between length 3 to 50.",
        },
      },
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "Cost must be greater than 0.",
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
    tableName: "maintenance_logs",
    timestamps: true,
    underscored: true,
    sequelize: db,
  }
);

export default MaintenanceLog;
