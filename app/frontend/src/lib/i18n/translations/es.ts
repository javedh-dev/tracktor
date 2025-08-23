export const metadata = {
  code: 'es',
  name: 'Español',
  nativeName: 'Español',
  flag: '🇪🇸',
  rtl: false
};

export default {
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    confirm: 'Confirmar',
    close: 'Cerrar',
    notAvailable: 'No Disponible'
  },
  app: {
    title: 'Tracktor',
    validatingAuth: 'Validando Autenticación...',
    redirecting: 'Redirigiendo...',
    settings: 'Configuraciones',
    logout: 'Cerrar Sesión'
  },
  dashboard: {
    title: 'Tus Vehículos',
    addVehicle: 'Agregar Vehículo',
    loadingVehicles: 'Cargando Vehículos...',
    selectVehicle: 'Selecciona un vehículo para ver datos de combustible y kilometraje',
    noDataAvailable: 'No hay datos disponibles para este vehículo.',
    vehicleTrends: 'Tendencias del Vehículo',
    fuelCostOverTime: 'Costo de Combustible en el Tiempo',
    mileageOverTime: 'Kilometraje en el Tiempo'
  },
  vehicle: {
    licensePlate: 'Placa',
    vin: 'VIN',
    color: 'Color',
    odometer: 'Odómetro',
    insurance: 'Seguro',
    pucc: 'PUCC',
    year: 'Año',
    active: 'Activo',
    inactive: 'Inactivo',
    logFuel: 'Registrar recarga de combustible',
    deleteSuccess: 'Vehículo eliminado exitosamente.',
    deleteError: 'Error al eliminar el vehículo.',
    connectionError: 'Error al conectar con el servidor.'
  },
  modals: {
    configurations: 'Configuraciones',
    addVehicle: 'Agregar Vehículo',
    editVehicle: 'Editar Vehículo',
    addInsurance: 'Agregar Seguro',
    editInsurance: 'Editar Seguro',
    addMaintenance: 'Agregar Registro de Mantenimiento',
    editMaintenance: 'Editar Registro de Mantenimiento',
    addFuelLog: 'Registrar Recarga de Combustible',
    editFuelLog: 'Editar Registro de Combustible',
    addPollution: 'Agregar Certificado de Contaminación',
    editPollution: 'Editar Certificado de Contaminación',
    pollutionDetails: 'Detalles del Certificado de Contaminación',
    noMaintenanceLogs: 'No hay registros de mantenimiento para este vehículo.',
    noPollutionCertificates: 'No hay certificados de contaminación para este vehículo.',
    noFuelLogs: 'No se encontraron registros de combustible para este vehículo.',
    noInsuranceLogs: 'No se encontraron registros de seguro para este vehículo.'
  },
  deleteConfirmation: {
    title: 'Eliminar',
    message: '¿Estás seguro de que quieres eliminar?'
  },
  navigation: {
    dashboard: 'Panel de Control',
    fuelLogs: 'Registros de Combustible',
    maintenance: 'Mantenimiento',
    insurance: 'Seguro',
    pollution: 'Certificado de Contaminación'
  },
  forms: {
    labels: {
      date: 'Fecha',
      odometer: 'Odómetro',
      fuelAmount: 'Cantidad de Combustible',
      cost: 'Costo',
      notes: 'Notas',
      startDate: 'Fecha de Inicio',
      endDate: 'Fecha de Fin',
      testingCenter: 'Centro de Pruebas',
      expiryDate: 'Fecha de Vencimiento',
      serviceCenter: 'Centro de Servicio',
      certificateNumber: 'Número de Certificado',
      issueDate: 'Fecha de Emisión',
      provider: 'Proveedor',
      policyNumber: 'Número de Póliza',
      make: 'Marca',
      model: 'Modelo',
      year: 'Año',
      color: 'Color',
      licensePlate: 'Placa',
      vinNumber: 'Número VIN'
    },
    placeholders: {
      date: 'Fecha',
      odometerReading: 'Lectura del Odómetro',
      fuelAmountLitres: 'Cantidad de Combustible (Litros)',
      costCurrency: 'Costo',
      notes: 'Notas',
      startDate: 'Fecha de Inicio',
      endDate: 'Fecha de Fin',
      testingCenter: 'Centro de Pruebas',
      expiryDate: 'Fecha de Vencimiento',
      serviceCenter: 'Centro de Servicio',
      certificateNumber: 'Número de Certificado',
      issueDate: 'Fecha de Emisión',
      provider: 'Proveedor',
      policyNumber: 'Número de Póliza',
      make: 'Marca',
      model: 'Modelo',
      year: 'Año',
      color: 'Color',
      licensePlate: 'Placa',
      vinNumber: 'Número VIN'
    },
    buttons: {
      add: 'Agregar',
      update: 'Actualizar'
    },
    validation: {
      noVehicleSelected: 'No se ha seleccionado ningún vehículo.',
      requiredFields: 'Fecha, Odómetro, Cantidad de Combustible y Costo son requeridos.',
      maintenanceRequired: 'Fecha, Odómetro, Centro de Servicio y Costo son requeridos.',
      insuranceRequired: 'Fecha de Inicio, Fecha de Fin y Costo son requeridos.',
      pollutionRequired: 'Fecha de Emisión, Fecha de Vencimiento y Centro de Pruebas son requeridos.',
      vehicleRequired: 'Marca, Modelo, Año y Placa son requeridos.'
    },
    success: {
      fuelLogAdded: '¡Registro de combustible agregado exitosamente!',
      fuelLogUpdated: '¡Registro de combustible actualizado exitosamente!',
      maintenanceAdded: '¡Registro de mantenimiento agregado exitosamente!',
      maintenanceUpdated: '¡Registro de mantenimiento actualizado exitosamente!',
      insuranceAdded: '¡Seguro agregado exitosamente!',
      insuranceUpdated: '¡Seguro actualizado exitosamente!',
      pollutionAdded: '¡Certificado de contaminación agregado exitosamente!',
      pollutionUpdated: '¡Certificado de contaminación actualizado exitosamente!',
      vehicleAdded: '¡Vehículo agregado exitosamente!',
      vehicleUpdated: '¡Vehículo actualizado exitosamente!'
    },
    errors: {
      connectionFailed: 'Error al conectar con el servidor.'
    }
  },
  config: {
    language: {
      title: 'Idioma',
      select: 'Seleccionar Idioma',
      description: 'Elige tu idioma preferido para la interfaz'
    },
    regional: {
      title: 'Configuración Regional',
      dateFormat: 'Formato de Fecha',
      currency: 'Moneda',
      units: 'Unidades de Medida'
    },
    dateFormats: {
      ddmmyyyy: 'DD/MM/AAAA',
      mmddyyyy: 'MM/DD/AAAA',
      yyyymmdd: 'AAAA-MM-DD',
      ddmmmyyyy: 'DD MMM, AAAA'
    },
    currencies: {
      inr: 'Rupia India (₹)',
      usd: 'Dólar Estadounidense ($)',
      eur: 'Euro (€)',
      gbp: 'Libra Esterlina (£)',
      mxn: 'Peso Mexicano ($)',
      ars: 'Peso Argentino ($)',
      cop: 'Peso Colombiano ($)',
      clp: 'Peso Chileno ($)',
      pen: 'Sol Peruano (S/)',
      brl: 'Real Brasileño (R$)'
    },
    units: {
      metric: 'Métrico (km, L)',
      imperial: 'Imperial (mi, gal)'
    },
    fields: {
      dateFormat: 'Formato de Fecha',
      currency: 'Moneda',
      unitOfMeasure: 'Unidad de Medida'
    },
    descriptions: {
      dateFormat: 'Selecciona cómo se mostrarán las fechas en la aplicación',
      currency: 'Elige tu moneda preferida para los cálculos financieros',
      unitOfMeasure: 'Selecciona entre unidades métricas o imperiales para las mediciones'
    },
    placeholders: {
      dateFormat: 'Seleccionar formato de fecha...',
      currency: 'Seleccionar moneda...',
      unitOfMeasure: 'Seleccionar unidades...'
    }
  },
  colorPicker: {
    selectedColor: 'Color Seleccionado',
    commonColors: 'Colores Comunes',
    showAdvanced: 'Mostrar Opciones Avanzadas',
    hideAdvanced: 'Ocultar Opciones Avanzadas',
    hue: 'Matiz',
    saturation: 'Saturación',
    lightness: 'Luminosidad',
    hexCode: 'Código Hex'
  }
};