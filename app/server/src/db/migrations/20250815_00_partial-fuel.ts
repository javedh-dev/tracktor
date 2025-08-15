import { DataTypes, Model, ModelAttributes, Optional } from 'sequelize';
import type { Migration } from '../index.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("fuel_logs", "filled", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  });
  await queryInterface.addColumn("fuel_logs", "missed_last", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });
}
export const down: Migration = ({ context: queryInterface }) => {
  return queryInterface.dropAllSchemas();
}
