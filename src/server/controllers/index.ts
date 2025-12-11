// Auth Controller
export { verifyPin, getPinStatus } from './authController';

// Config Controller
export { getConfig, getConfigByKey, updateConfig } from './configController';

// Vehicle Controller
export {
	addVehicle,
	getAllVehicles,
	getVehicleById,
	updateVehicle,
	deleteVehicle
} from './vehicleController';

// Fuel Log Controller
export {
	addFuelLog,
	getFuelLogs,
	getFuelLogById,
	updateFuelLog,
	deleteFuelLog,
	addFuelLogByLicensePlate,
	getFuelLogsByLicensePlate
} from './fuelLogController';

// Insurance Controller
export {
	addInsurance,
	getInsurances,
	getInsuranceById,
	updateInsurance,
	deleteInsurance
} from './insuranceController';

// Maintenance Log Controller
export {
	addMaintenanceLog,
	getMaintenanceLogs,
	getMaintenanceLogById,
	updateMaintenanceLog,
	deleteMaintenanceLog
} from './maintenanceLogController';

// PUCC Controller
export {
	addPucc,
	getPuccs,
	getPuccById,
	updatePucc,
	deletePucc,
	// Backward compatibility aliases
	addPollutionCertificate,
	getPollutionCertificates,
	updatePollutionCertificate,
	deletePollutionCertificate
} from './puccController';

// File Controller
export { uploadFile, downloadFile } from './fileController';
