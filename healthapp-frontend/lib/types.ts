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

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  NON_BINARY = "NON_BINARY",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Stays as string for input[type=date]
  gender: Gender | '';
  email: string;
  phoneNumber: string;
  address: Address;
  emergencyContact: EmergencyContact;
}
