import { DataTypes } from "sequelize";
import type { Migration } from "../index.js";

export const up: Migration = async ({ context: queryInterface }) => {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.createTable(
      "auth",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        hash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction }
    );

    await queryInterface.createTable(
      "config",
      {
        key: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        value: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction }
    );

    await queryInterface.createTable(
      "vehicles",
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
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
          unique: true,
        },
        color: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        odometer: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction }
    );

    await queryInterface.createTable(
      "insurances",
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        vehicle_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "vehicles",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction }
    );

    await queryInterface.createTable(
      "maintenance_logs",
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        vehicle_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "vehicles",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction }
    );

    await queryInterface.createTable(
      "fuel_logs",
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        vehicle_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "vehicles",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction }
    );

    await queryInterface.createTable(
      "pollution_certificates",
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        vehicle_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "vehicles",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction }
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const down: Migration = async ({ context: queryInterface }) => {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.dropTable("pollution_certificates", { transaction });
    await queryInterface.dropTable("fuel_logs", { transaction });
    await queryInterface.dropTable("maintenance_logs", { transaction });
    await queryInterface.dropTable("insurances", { transaction });
    await queryInterface.dropTable("vehicles", { transaction });
    await queryInterface.dropTable("config", { transaction });
    await queryInterface.dropTable("auth", { transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
