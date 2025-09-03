import { DataTypes, Model, Optional } from "sequelize";
import { db } from "@db/index.js";
import { PollutionCertificateError } from "@exceptions/PollutionCertificateError.js";
import { Status } from "@exceptions/ServiceError.js";

interface PollutionCertificateAttributes {
  id: string;
  vehicleId: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  testingCenter: string;
  notes?: string;
}

interface PollutionCertificateCreationAttributes
  extends Optional<PollutionCertificateAttributes, "id"> {}

class PollutionCertificate
  extends Model<
    PollutionCertificateAttributes,
    PollutionCertificateCreationAttributes
  >
  implements PollutionCertificateAttributes
{
  declare public id: string;
  declare public vehicleId: string;
  declare public certificateNumber: string;
  declare public issueDate: string;
  declare public expiryDate: string;
  declare public testingCenter: string;
  declare public notes: string;
}

PollutionCertificate.init(
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
    certificateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [3, 50],
          msg: "Certificate Number must be between length 3 to 50.",
        },
        is: {
          args: "^[0-9A-Za-z- ]*$",
          msg: "Only number and characters with space and hyphen are allowed in certificate number.",
        },
      },
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          args: true,
          msg: "Issue date format is not correct.",
        },
      },
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          args: true,
          msg: "Expiry date format is not correct.",
        },
      },
    },
    testingCenter: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [3, 50],
          msg: "Testing Center must be between length 3 to 50.",
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
    tableName: "pollution_certificates",
    timestamps: true,
    underscored: true,
    sequelize: db,
    validate: {
      async validateDates() {
        const previousInsEndDate = await PollutionCertificate.max(
          "expiryDate",
          {
            where: {
              vehicleId: this.vehicleId as string,
            },
          },
        );

        const sDate = new Date(this.issueDate as string);
        const eDate = new Date(this.expiryDate as string);
        const maxEndDate = new Date(previousInsEndDate as string);

        if (sDate >= eDate) {
          throw new PollutionCertificateError(
            "Issue date must always be before Expiry date.",
            Status.BAD_REQUEST,
          );
        }

        if (sDate < maxEndDate) {
          throw new PollutionCertificateError(
            "Issue date must always be after previous PUCC Expiry date.",
            Status.BAD_REQUEST,
          );
        }
      },
    },
  },
);

export default PollutionCertificate;
