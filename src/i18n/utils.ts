export const languages = {
  es: 'Español',
  en: 'English',
};

export const defaultLang = 'es';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as keyof typeof languages;
  return defaultLang;
}

export function useTranslatedPath(lang: keyof typeof languages) {
  return function translatePath(path: string, l: string = lang) {
    return l === defaultLang ? path : `/${l}${path}`;
  };
}

export async function getContent(lang: string, page: string) {
  try {
    const content = await import(`../content/pages/${lang}/${page}.json`);
    return content.default;
  } catch {
    // Fallback to Spanish if translation doesn't exist
    const content = await import(`../content/pages/es/${page}.json`);
    return content.default;
  }
}

export async function getNavigation(lang: string) {
  const nav = await import('../content/settings/navigation.json');
  return nav.default[lang as keyof typeof nav.default] || nav.default.es;
}

// UI translations for common elements
export const ui = {
  es: {
    'nav.historia': 'Historia',
    'nav.motos': 'Motos',
    'nav.inscripciones': 'Inscripciones',
    'nav.cta': 'Inscríbete',
    'nav.dashboard': 'Mi Equipo',
    'nav.login': 'Iniciar Sesión',
    'nav.logout': 'Cerrar Sesión',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.inspired': 'Inspirado en FreeTech Endurance UK',
    'footer.links': 'Enlaces',
    'footer.contact': 'Contacto',
    'footer.description': 'La experiencia definitiva del motorsport amateur. 8 horas de pura resistencia sobre motos 125cc de serie.',
    'lang.switch': 'English',
    // Auth
    'auth.login.title': 'Iniciar Sesión',
    'auth.login.subtitle': 'Accede a tu cuenta para gestionar tu equipo',
    'auth.login.button': 'Iniciar Sesión',
    'auth.login.noAccount': '¿No tienes cuenta?',
    'auth.login.createAccount': 'Crear cuenta',
    'auth.signup.title': 'Crear Cuenta',
    'auth.signup.subtitle': 'Regístrate para inscribir a tu equipo',
    'auth.signup.button': 'Crear Cuenta',
    'auth.signup.hasAccount': '¿Ya tienes cuenta?',
    'auth.signup.login': 'Iniciar sesión',
    'auth.confirmEmail': 'Te hemos enviado un email de confirmación. Por favor, revisa tu bandeja de entrada.',
    'auth.error': 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
    // Dashboard
    'dashboard.title': 'Mi Equipo',
    'dashboard.welcome': 'Bienvenido',
    'dashboard.noTeam': 'Todavía no tienes un equipo registrado',
    'dashboard.createTeam': 'Crear Equipo',
    'dashboard.editTeam': 'Editar Equipo',
    'dashboard.teamInfo': 'Información del Equipo',
    'dashboard.pilots': 'Pilotos',
    'dashboard.staff': 'Staff',
    'dashboard.motorcycle': 'Motocicleta',
    'dashboard.status': 'Estado',
    'dashboard.status.draft': 'Borrador',
    'dashboard.status.pending': 'Pendiente',
    'dashboard.status.confirmed': 'Confirmado',
    'dashboard.progress': 'Progreso del Registro',
    'dashboard.pilotsCount': 'pilotos registrados',
    'dashboard.minPilots': 'Mínimo 4 pilotos requeridos',
    'dashboard.addPilot': 'Añadir Piloto',
    'dashboard.addStaff': 'Añadir Staff',
    'dashboard.maxStaff': 'Máximo 4 miembros de staff',
    'dashboard.save': 'Guardar',
    'dashboard.cancel': 'Cancelar',
    'dashboard.delete': 'Eliminar',
    'dashboard.confirmDelete': '¿Estás seguro de que quieres eliminar este registro?',
    // Form labels
    'form.teamName': 'Nombre del Equipo',
    'form.numberOfPilots': 'Número de Pilotos',
    'form.representativeName': 'Nombre del Representante',
    'form.representativeSurname': 'Apellidos del Representante',
    'form.representativeDni': 'DNI del Representante',
    'form.representativePhone': 'Teléfono del Representante',
    'form.representativeEmail': 'Email del Representante',
    'form.address': 'Dirección',
    'form.municipality': 'Municipio',
    'form.postalCode': 'Código Postal',
    'form.province': 'Provincia',
    'form.motorcycleBrand': 'Marca de la Moto',
    'form.motorcycleModel': 'Modelo de la Moto',
    'form.engineCapacity': 'Cilindrada',
    'form.engineCapacity.125cc': '125cc 4T',
    'form.engineCapacity.50cc': '50cc 2T',
    'form.registrationDate': 'Fecha de Matriculación',
    'form.modifications': 'Modificaciones',
    'form.comments': 'Comentarios',
    'form.gdprConsent': 'Acepto la política de privacidad y el tratamiento de mis datos',
    'form.pilotName': 'Nombre',
    'form.pilotSurname': 'Apellidos',
    'form.pilotDni': 'DNI',
    'form.pilotEmail': 'Email',
    'form.pilotPhone': 'Teléfono',
    'form.emergencyContactName': 'Nombre Contacto Emergencia',
    'form.emergencyContactPhone': 'Teléfono Contacto Emergencia',
    'form.drivingLevel': 'Nivel de Conducción',
    'form.drivingLevel.amateur': 'Amateur',
    'form.drivingLevel.intermediate': 'Intermedio',
    'form.drivingLevel.advanced': 'Avanzado',
    'form.drivingLevel.expert': 'Experto',
    'form.trackExperience': 'Experiencia en Circuito',
    'form.staffName': 'Nombre',
    'form.staffDni': 'DNI',
    'form.staffPhone': 'Teléfono',
    'form.staffRole': 'Rol',
    'form.staffRole.mechanic': 'Mecánico',
    'form.staffRole.coordinator': 'Coordinador',
    'form.staffRole.support': 'Apoyo',
    'form.required': 'Este campo es obligatorio',
    'form.invalidEmail': 'Email no válido',
  },
  en: {
    'nav.historia': 'Story',
    'nav.motos': 'Bikes',
    'nav.inscripciones': 'Registration',
    'nav.cta': 'Register',
    'nav.dashboard': 'My Team',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'footer.rights': 'All rights reserved.',
    'footer.inspired': 'Inspired by FreeTech Endurance UK',
    'footer.links': 'Links',
    'footer.contact': 'Contact',
    'footer.description': 'The ultimate amateur motorsport experience. 8 hours of pure endurance on stock 125cc motorcycles.',
    'lang.switch': 'Español',
    // Auth
    'auth.login.title': 'Login',
    'auth.login.subtitle': 'Access your account to manage your team',
    'auth.login.button': 'Login',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.createAccount': 'Create account',
    'auth.signup.title': 'Create Account',
    'auth.signup.subtitle': 'Register to sign up your team',
    'auth.signup.button': 'Create Account',
    'auth.signup.hasAccount': 'Already have an account?',
    'auth.signup.login': 'Login',
    'auth.confirmEmail': 'We have sent you a confirmation email. Please check your inbox.',
    'auth.error': 'An error occurred. Please try again.',
    // Dashboard
    'dashboard.title': 'My Team',
    'dashboard.welcome': 'Welcome',
    'dashboard.noTeam': "You don't have a registered team yet",
    'dashboard.createTeam': 'Create Team',
    'dashboard.editTeam': 'Edit Team',
    'dashboard.teamInfo': 'Team Information',
    'dashboard.pilots': 'Pilots',
    'dashboard.staff': 'Staff',
    'dashboard.motorcycle': 'Motorcycle',
    'dashboard.status': 'Status',
    'dashboard.status.draft': 'Draft',
    'dashboard.status.pending': 'Pending',
    'dashboard.status.confirmed': 'Confirmed',
    'dashboard.progress': 'Registration Progress',
    'dashboard.pilotsCount': 'pilots registered',
    'dashboard.minPilots': 'Minimum 4 pilots required',
    'dashboard.addPilot': 'Add Pilot',
    'dashboard.addStaff': 'Add Staff',
    'dashboard.maxStaff': 'Maximum 4 staff members',
    'dashboard.save': 'Save',
    'dashboard.cancel': 'Cancel',
    'dashboard.delete': 'Delete',
    'dashboard.confirmDelete': 'Are you sure you want to delete this record?',
    // Form labels
    'form.teamName': 'Team Name',
    'form.numberOfPilots': 'Number of Pilots',
    'form.representativeName': 'Representative Name',
    'form.representativeSurname': 'Representative Surname',
    'form.representativeDni': 'Representative ID',
    'form.representativePhone': 'Representative Phone',
    'form.representativeEmail': 'Representative Email',
    'form.address': 'Address',
    'form.municipality': 'Municipality',
    'form.postalCode': 'Postal Code',
    'form.province': 'Province',
    'form.motorcycleBrand': 'Motorcycle Brand',
    'form.motorcycleModel': 'Motorcycle Model',
    'form.engineCapacity': 'Engine Capacity',
    'form.engineCapacity.125cc': '125cc 4T',
    'form.engineCapacity.50cc': '50cc 2T',
    'form.registrationDate': 'Registration Date',
    'form.modifications': 'Modifications',
    'form.comments': 'Comments',
    'form.gdprConsent': 'I accept the privacy policy and the processing of my data',
    'form.pilotName': 'Name',
    'form.pilotSurname': 'Surname',
    'form.pilotDni': 'ID Number',
    'form.pilotEmail': 'Email',
    'form.pilotPhone': 'Phone',
    'form.emergencyContactName': 'Emergency Contact Name',
    'form.emergencyContactPhone': 'Emergency Contact Phone',
    'form.drivingLevel': 'Driving Level',
    'form.drivingLevel.amateur': 'Amateur',
    'form.drivingLevel.intermediate': 'Intermediate',
    'form.drivingLevel.advanced': 'Advanced',
    'form.drivingLevel.expert': 'Expert',
    'form.trackExperience': 'Track Experience',
    'form.staffName': 'Name',
    'form.staffDni': 'ID Number',
    'form.staffPhone': 'Phone',
    'form.staffRole': 'Role',
    'form.staffRole.mechanic': 'Mechanic',
    'form.staffRole.coordinator': 'Coordinator',
    'form.staffRole.support': 'Support',
    'form.required': 'This field is required',
    'form.invalidEmail': 'Invalid email',
  },
} as const;

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}
