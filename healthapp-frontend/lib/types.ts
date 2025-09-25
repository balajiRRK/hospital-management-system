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
