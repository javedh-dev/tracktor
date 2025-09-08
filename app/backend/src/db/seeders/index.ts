import bcrypt from "bcrypt";
import {
  Auth,
  Config,
  FuelLog,
  Insurance,
  MaintenanceLog,
  PollutionCertificate,
  Vehicle,
} from "@models/index.js";
import env from "@config/env.js";

export const seedInitialConfig = async () => {
  const configData = [
    {
      key: "dateFormat",
      value: "MM/dd/yyyy",
      description: "Format for displaying dates",
    },
    {
      key: "currency",
      value: "USD",
      description: "Default currency for financial transactions",
    },
    {
      key: "unitOfMeasure",
      value: "metric",
      description: "Unit of measure for distance and volume",
    },
  ];

  await Config.bulkCreate(configData, {
    ignoreDuplicates: true,
  });
  console.log("Initial configuration seeded");
};

export const seedAuthPin = async (pin: string) => {
  const hash = await bcrypt.hash(pin, 10);
  await Auth.upsert({ id: 1, hash });
  console.log("Authentication PIN configured");
};

export const seedDemoData = async () => {
  if (!env.FORCE_DEMO_SEED_DATA) {
    const existingVehicles = await Vehicle.count();
    if (existingVehicles > 0) {
      console.log("Demo data already exists, skipping");
      return;
    }
  } else {
    console.log("Forcing demo data seed");
    await Vehicle.destroy({ truncate: true });
  }

  const vehicle1 = await Vehicle.create({
    make: "Honda",
    model: "Civic",
    year: 2022,
    licensePlate: "TS07JA1997",
    vin: "1HGFC1F7XNA000001",
    color: "#000",
    odometer: 15000,
  });

  const vehicle2 = await Vehicle.create({
    make: "Toyota",
    model: "Corolla",
    year: 2021,
    licensePlate: "AP28DX2000",
    vin: "1NXBU4EE4AZ000002",
    color: "#FFF",
    odometer: 25000,
  });

  await Insurance.bulkCreate([
    {
      vehicleId: vehicle1.id,
      provider: "Allstate",
      policyNumber: "123456789",
      startDate: "2023-01-01",
      endDate: "2024-01-01",
      cost: 1200,
    },
    {
      vehicleId: vehicle2.id,
      provider: "Geico",
      policyNumber: "987654321",
      startDate: "2023-01-01",
      endDate: "2024-01-01",
      cost: 1500,
    },
  ]);

  await MaintenanceLog.bulkCreate([
    {
      vehicleId: vehicle1.id,
      date: "2023-06-01",
      odometer: 18000,
      serviceCenter: "Test Center",
      cost: 50,
      notes: "Oil Change",
    },
    {
      vehicleId: vehicle2.id,
      date: "2023-07-01",
      odometer: 28000,
      serviceCenter: "Test Center",
      cost: 30,
      notes: "Tire Rotation",
    },
  ]);

  await PollutionCertificate.bulkCreate([
    {
      vehicleId: vehicle1.id,
      certificateNumber: "PUCC12345",
      issueDate: "2023-01-01",
      expiryDate: "2024-01-01",
      testingCenter: "Green Drive",
    },
    {
      vehicleId: vehicle2.id,
      certificateNumber: "PUCC54321",
      issueDate: "2023-01-01",
      expiryDate: "2024-01-01",
      testingCenter: "Eco Test",
    },
  ]);

  const vehicle1FuelLogs = [
    {
      vehicleId: vehicle1.id,
      date: "2024-01-15",
      odometer: 15500,
      fuelAmount: 35,
      cost: 50,
      notes: "Full tank",
      filled: true,
      missedLast: false
    },
    {
      vehicleId: vehicle1.id,
      date: "2024-02-15",
      odometer: 16000,
      fuelAmount: 32,
      cost: 48,
      filled: true,
      missedLast: false
    },
  ];

  const vehicle2FuelLogs = [
    {
      vehicleId: vehicle2.id,
      date: "2024-01-20",
      odometer: 25600,
      fuelAmount: 40,
      cost: 60,
      filled: true,
      missedLast: false
    },
    {
      vehicleId: vehicle2.id,
      date: "2024-02-20",
      odometer: 26200,
      fuelAmount: 38,
      cost: 55,
      notes: "Filled at Shell",
      filled: true,
      missedLast: false
    },
  ];

  let currentDate1 = new Date("2024-04-15");
  let currentOdometer1 = 17000;
  for (let i = 0; i < 50; i++) {
    currentDate1.setDate(currentDate1.getDate() + 7);
    currentOdometer1 += Math.floor(Math.random() * 301) + 200;
    const fuelAmount = Math.random() * 11 + 30;
    const cost = Math.random() * 16 + 50;
    vehicle1FuelLogs.push({
      vehicleId: vehicle1.id,
      date: currentDate1.toISOString().split("T")[0] || "",
      odometer: currentOdometer1,
      fuelAmount: parseFloat(fuelAmount.toFixed(2)),
      cost: parseFloat(cost.toFixed(2)),
      filled: true,
      missedLast: false
    });
  }

  let currentDate2 = new Date("2024-04-20");
  let currentOdometer2 = 27400;
  for (let i = 0; i < 50; i++) {
    currentDate2.setDate(currentDate2.getDate() + 7);
    currentOdometer2 += Math.floor(Math.random() * 301) + 200;
    const fuelAmount = Math.random() * 11 + 30;
    const cost = Math.random() * 16 + 50;
    vehicle2FuelLogs.push({
      vehicleId: vehicle2.id,
      date: currentDate2.toISOString().split("T")[0] || "",
      odometer: currentOdometer2,
      fuelAmount: parseFloat(fuelAmount.toFixed(2)),
      cost: parseFloat(cost.toFixed(2)),
      filled: true,
      missedLast: false
    });
  }

  await FuelLog.bulkCreate(vehicle1FuelLogs);
  await FuelLog.bulkCreate(vehicle2FuelLogs);

  console.log("Demo data seeded successfully");
};
