'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createAppointment, getDoctorAvailability, listDoctors } from '@/lib/api';
import { type Doctor } from '@/lib/types';
import { fmtHumanDate, yyyyMmDd } from '@/lib/utils';

const APPOINTMENT_DURATION_MS = 60 * 60 * 1000; // 60 minutes

export default function AppointmentScheduler() {
  // Data fetched from the server
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const canSubmit = !!doctorId && !!date && !!selectedTime && reason.trim().length > 0;

  // fetch the list of doctors when the component first load
  useEffect(() => {
    listDoctors()
      .then(setDoctors)
      .catch((e) => {
        console.error('Failed to fetch doctors:', e);
        setDoctors([]);
      });
  }, []);

  // fetch available time slots when the selected doctor or date changes.
  useEffect(() => {
    let cancel = false;
    const fetchAvailability = async () => {
      // Don't fetch if we don't have a doctor and date selected.
      if (!doctorId || !date) return;

      setAvailableSlots([]);
      setSelectedTime(null);
      setServerErr(null);
      setLoadingSlots(true);

      try {
        const { slots } = await getDoctorAvailability(doctorId, yyyyMmDd(date));
        if (!cancel) setAvailableSlots(slots ?? []);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load availability';
        if (!cancel) setServerErr(message);
      } finally {
        if (!cancel) setLoadingSlots(false);
      }
    };

    fetchAvailability();

    return () => {
      cancel = true;
    };
  }, [doctorId, date]);

  // Memo the calculation and disable all days before today in the calendar.
  const disabledDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [{ before: today }];
  }, []);

  /**
   * Handles the form submission to create a new appointment.
   */
  const submit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setServerMsg(null);
    setServerErr(null);

    try {
      // make the start and end times from the selected date and time string.
      const [hh, mm] = selectedTime.split(':').map(Number);
      const start = new Date(date);
      start.setHours(hh, mm, 0, 0);
      const end = new Date(start.getTime() + APPOINTMENT_DURATION_MS);

      // Call the API to create the appointment.
      await createAppointment({
        doctorId: doctorId,
        // .toISOString() converts the date to a UTC string
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        reason: reason.trim(),
      });

      setServerMsg('Appointment created');
      setReason('');
      setSelectedTime(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to create appointment';
      setServerErr(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-3xl gap-0 p-0">
      {/* Doctor and Reason Inputs */}
      <CardContent className="p-4 md:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Doctor Selector */}
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium">Doctor</label>
            <Select
              onValueChange={(v) => setDoctorId(Number(v))}
              value={doctorId ? String(doctorId) : ''}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name ?? d.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason Input */}
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium">Reason</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief reason for visit"
            />
          </div>
        </div>
      </CardContent>

      {/* Date and Time Selection */}
      <CardContent className="p-0">
        <div className="grid gap-0 md:grid-cols-2">
          {/* Calendar for Date Selection */}
          <div className="w-full p-4 md:p-6">
            <label className="mb-1 block text-sm font-medium">Date</label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={disabledDays}
              className="w-full bg-transparent p-0"
            />
          </div>

          {/* Time Slots */}
          <div className="border-t p-4 md:border-t-0 md:border-l md:p-6">
            <div className="mb-2 text-sm font-medium">Available Times</div>
            {/* render content based on the current state */}
            {loadingSlots ? (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                Loading times...
              </div>
            ) : !doctorId || !date ? (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                Please select a doctor and a date.
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                No slots available for {fmtHumanDate(date)}.
              </div>
            ) : (
              // render a button for each available time slot returned by the API.
              <div className="no-scrollbar max-h-80 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(time)}
                      className="w-full shadow-none"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer has summary and submit */}
      <CardFooter className="flex flex-col items-start gap-3 border-t px-4 py-4 md:flex-row md:items-center md:px-6">
        <div className="text-sm md:flex-1">
          {date && selectedTime ? (
            <>
              Selected: <span className="font-medium">{fmtHumanDate(date)}</span> at{' '}
              <span className="font-medium">{selectedTime}</span>
            </>
          ) : (
            'Please select a date and time.'
          )}
        </div>
        <Button disabled={!canSubmit || submitting} onClick={submit} className="w-full md:w-auto">
          {submitting ? 'Booking...' : 'Book Appointment'}
        </Button>
      </CardFooter>

      {/* Server message and error */}
      {(serverMsg || serverErr) && (
        <div className="border-t px-6 py-4">
          {serverMsg && <p className="text-sm text-green-600">{serverMsg}</p>}
          {serverErr && <p className="text-sm text-red-600">{serverErr}</p>}
        </div>
      )}
    </Card>
  );
}
