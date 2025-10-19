// shape of our data
export interface Doctor {
  id: number;
  email: string;
  name?: string;
}

export interface AppointmentResponse {
  id: number;
  startTime: string;
  reason: string;
  doctorId: number;
  doctorName?: string;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export interface Address {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  phoneNumber: string;
}

//  the primary profile type used throughout the UI
export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  profilePhotoUrl: string | null;
  dateOfBirth: string;
  gender: Gender | '';
  address: Address;
  emergencyContact: EmergencyContact;
}

// profile that match exact data structure sent from backend API
export type UserProfileResponseDto = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  profilePhotoUrl: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  address: Address | null;
  emergencyContact: EmergencyContact | null;
};

// expected DTO when sending updates to the backend
export type UserProfileDto = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  address: Address | null;
  emergencyContact: EmergencyContact | null;
};

/**
 * Convert the backend DTO to a UI-friendly object.
 * Ensures nulls are replaced with safe defaults for React inputs.
 */
export function dtoToUi(dto: UserProfileResponseDto): UserProfile {
  return {
    id: dto.id,
    firstName: dto.firstName ?? '',
    lastName: dto.lastName ?? '',
    email: dto.email ?? '',
    phoneNumber: dto.phoneNumber ?? null,
    profilePhotoUrl: dto.profilePhotoUrl ?? null,
    dateOfBirth: dto.dateOfBirth ?? '',
    gender: dto.gender ?? '',
    address: dto.address ?? { streetAddress: '', city: '', state: '', postalCode: '', country: '' },
    emergencyContact: dto.emergencyContact ?? { name: '', phoneNumber: '' },
  };
}

/**
 * Convert the UI-friendly object back into a backend DTO.
 * Ensures empty strings are sent as `null` for optional fields.
 */
export function uiToDto(ui: UserProfile): UserProfileDto {
  return {
    firstName: ui.firstName,
    lastName: ui.lastName,
    email: ui.email,
    phoneNumber: ui.phoneNumber ?? null,
    dateOfBirth: ui.dateOfBirth || null,
    gender: (ui.gender as Gender) || null,
    address: ui.address ?? null,
    emergencyContact: ui.emergencyContact ?? null,
  };
}
