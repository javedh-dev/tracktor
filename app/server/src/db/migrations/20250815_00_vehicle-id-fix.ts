import { DataTypes, Model, ModelAttributes, Optional } from 'sequelize';
import type { Migration } from '../index.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn("maintenance_logs", "vehicle_id", {
    type: DataTypes.UUIDV4,
  });
}
export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn("maintenance_logs", "vehicle_id", {
    type: DataTypes.INTEGER,
  });
}
