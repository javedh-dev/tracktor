import { DataTypes, Model, ModelAttributes, Optional } from 'sequelize';
import type { Migration } from '../index.js';

const commonTimestamps: ModelAttributes = {
  created_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("auth", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ...commonTimestamps
  });
  await queryInterface.createTable("config", {
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
    ...commonTimestamps
  });
  await queryInterface.createTable("vehicles", {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    make: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    license_plate: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    vin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    odometer: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ...commonTimestamps
  });
  await queryInterface.createTable("fuel_logs", {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    vehicle_id: {
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
    },
    fuel_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ...commonTimestamps
  });
  await queryInterface.createTable("insurances", {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    vehicle_id: {
      type: DataTypes.UUIDV4,
      references: {
        model: "vehicles",
        key: "id",
      },
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    policy_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ...commonTimestamps
  });
  await queryInterface.createTable("maintenance_logs", {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "vehicles",
        key: "id",
      },
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    odometer: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_center: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ...commonTimestamps
  });
  await queryInterface.createTable("pollution_certificates", {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    vehicle_id: {
      type: DataTypes.UUIDV4,
      references: {
        model: "vehicles",
        key: "id",
      },
      allowNull: false,
    },
    certificate_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    testing_center: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ...commonTimestamps
  });
}
export const down: Migration = ({ context: queryInterface }) => {
  return queryInterface.dropAllSchemas();
}
