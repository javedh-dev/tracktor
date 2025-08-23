export const metadata = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  flag: '🇺🇸',
  rtl: false
};

export default {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    close: 'Close',
    notAvailable: 'Not Available'
  },
  app: {
    title: 'Tracktor',
    validatingAuth: 'Validating Auth...',
    redirecting: 'Redirecting...',
    settings: 'Settings',
    logout: 'Logout'
  },
  dashboard: {
    title: 'Your Vehicles',
    addVehicle: 'Add Vehicle',
    loadingVehicles: 'Loading Vehicles...',
    selectVehicle: 'Select a vehicle to view fuel and mileage data',
    noDataAvailable: 'No data available for this vehicle.',
    vehicleTrends: 'Vehicle Trends',
    fuelCostOverTime: 'Fuel Cost Over Time',
    mileageOverTime: 'Mileage Over Time'
  },
  vehicle: {
    licensePlate: 'License Plate',
    vin: 'VIN',
    color: 'Color',
    odometer: 'Odometer',
    insurance: 'Insurance',
    pucc: 'PUCC',
    year: 'Year',
    active: 'Active',
    inactive: 'Inactive',
    logFuel: 'Log fuel refill',
    deleteSuccess: 'Vehicle deleted successfully.',
    deleteError: 'Failed to delete vehicle.',
    connectionError: 'Failed to connect to the server.'
  },
  modals: {
    configurations: 'Configurations',
    addVehicle: 'Add Vehicle',
    editVehicle: 'Edit Vehicle',
    addInsurance: 'Add Insurance',
    editInsurance: 'Edit Insurance',
    addMaintenance: 'Add Maintenance Log',
    editMaintenance: 'Edit Maintenance Log',
    addFuelLog: 'Log Fuel Refill',
    editFuelLog: 'Edit Fuel Log',
    addPollution: 'Add Pollution Certificate',
    editPollution: 'Edit Pollution Certificate',
    pollutionDetails: 'Pollution Certificate Details',
    noMaintenanceLogs: 'No maintenance logs for this vehicle.',
    noPollutionCertificates: 'No pollution certificates for this vehicle.',
    noFuelLogs: 'No fuel refill logs found for this vehicle.',
    noInsuranceLogs: 'No Insurance found for this vehicle.'
  },
  deleteConfirmation: {
    title: 'Delete',
    message: 'Are you sure you want to delete?'
  },
  navigation: {
    dashboard: 'Dashboard',
    fuelLogs: 'Fuel Logs',
    maintenance: 'Maintenance',
    insurance: 'Insurance',
    pollution: 'Pollution Certificate'
  },
  forms: {
    labels: {
      date: 'Date',
      odometer: 'Odometer',
      fuelAmount: 'Fuel Amount',
      cost: 'Cost',
      notes: 'Notes',
      startDate: 'Start Date',
      endDate: 'End Date',
      testingCenter: 'Testing Center',
      expiryDate: 'Expiry Date',
      serviceCenter: 'Service Center',
      certificateNumber: 'Certificate Number',
      issueDate: 'Issue Date',
      provider: 'Provider',
      policyNumber: 'Policy Number',
      make: 'Make',
      model: 'Model',
      year: 'Year',
      color: 'Color',
      licensePlate: 'License Plate',
      vinNumber: 'VIN Number'
    },
    placeholders: {
      date: 'Date',
      odometerReading: 'Odometer Reading',
      fuelAmountLitres: 'Fuel Amount (Litres)',
      costCurrency: 'Cost',
      notes: 'Notes',
      startDate: 'Start Date',
      endDate: 'End Date',
      testingCenter: 'Testing Center',
      expiryDate: 'Expiry Date',
      serviceCenter: 'Service Center',
      certificateNumber: 'Certificate Number',
      issueDate: 'Issue Date',
      provider: 'Provider',
      policyNumber: 'Policy Number',
      make: 'Make',
      model: 'Model',
      year: 'Year',
      color: 'Color',
      licensePlate: 'License Plate',
      vinNumber: 'VIN Number'
    },
    buttons: {
      add: 'Add',
      update: 'Update'
    },
    validation: {
      noVehicleSelected: 'No vehicle selected.',
      requiredFields: 'Date, Odometer, Fuel Amount, and Cost are required.',
      maintenanceRequired: 'Date, Odometer, Service Center, and Cost are required.',
      insuranceRequired: 'Start Date, End Date, and Cost are required.',
      pollutionRequired: 'Issue Date, Expiry Date, and Testing Center are required.',
      vehicleRequired: 'Make, Model, Year, and License Plate are required.'
    },
    success: {
      fuelLogAdded: 'Fuel refill log added successfully!',
      fuelLogUpdated: 'Fuel refill log updated successfully!',
      maintenanceAdded: 'Maintenance log added successfully!',
      maintenanceUpdated: 'Maintenance log updated successfully!',
      insuranceAdded: 'Insurance added successfully!',
      insuranceUpdated: 'Insurance updated successfully!',
      pollutionAdded: 'Pollution certificate added successfully!',
      pollutionUpdated: 'Pollution certificate updated successfully!',
      vehicleAdded: 'Vehicle added successfully!',
      vehicleUpdated: 'Vehicle updated successfully!'
    },
    errors: {
      connectionFailed: 'Failed to connect to the server.'
    }
  },
  config: {
    language: {
      title: 'Language',
      select: 'Select Language',
      description: 'Choose your preferred language for the interface'
    },
    regional: {
      title: 'Regional Settings',
      dateFormat: 'Date Format',
      currency: 'Currency',
      units: 'Units of Measure'
    },
    dateFormats: {
      ddmmyyyy: 'DD/MM/YYYY',
      mmddyyyy: 'MM/DD/YYYY',
      yyyymmdd: 'YYYY-MM-DD',
      ddmmmyyyy: 'DD MMM, YYYY'
    },
    currencies: {
      inr: 'Indian Rupee (₹)',
      usd: 'US Dollar ($)',
      eur: 'Euro (€)',
      gbp: 'British Pound (£)',
      mxn: 'Mexican Peso ($)',
      ars: 'Argentine Peso ($)',
      cop: 'Colombian Peso ($)',
      clp: 'Chilean Peso ($)',
      pen: 'Peruvian Sol (S/)',
      brl: 'Brazilian Real (R$)'
    },
    units: {
      metric: 'Metric (km, L)',
      imperial: 'Imperial (mi, gal)'
    },
    fields: {
      dateFormat: 'Date Format',
      currency: 'Currency',
      unitOfMeasure: 'Unit of Measure'
    },
    descriptions: {
      dateFormat: 'Select how dates should be displayed throughout the application',
      currency: 'Choose your preferred currency for financial calculations',
      unitOfMeasure: 'Select between metric or imperial units for measurements'
    },
    placeholders: {
      dateFormat: 'Select date format...',
      currency: 'Select currency...',
      unitOfMeasure: 'Select units...'
    }
  },
  colorPicker: {
    selectedColor: 'Selected Color',
    commonColors: 'Common Colors',
    showAdvanced: 'Show Advanced Options',
    hideAdvanced: 'Hide Advanced Options',
    hue: 'Hue',
    saturation: 'Saturation',
    lightness: 'Lightness',
    hexCode: 'Hex Code'
  }
};