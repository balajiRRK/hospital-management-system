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

import {
  createAppointment,
  type Doctor,
  getDoctorAvailability,
  getMe,
  listDoctors,
  type MeResponse,
} from './api';

function yyyyMmDd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function fmtHumanDate(d: Date) {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function AppointmentScheduler() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState<number | null>(null);

  const [date, setDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const canSubmit = !!doctorId && !!date && !!selectedTime && reason.trim().length > 0;

  useEffect(() => {
    getMe()
      .then(setMe)
      .catch(() => setMe(null));
    listDoctors()
      .then(setDoctors)
      .catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setAvailableSlots([]);
      setSelectedTime(null);
      setServerErr(null);
      if (!doctorId || !date) return;
      try {
        const { slots } = await getDoctorAvailability(doctorId, yyyyMmDd(date));
        if (!cancel) setAvailableSlots(slots ?? []);
      } catch (e: any) {
        if (!cancel) setServerErr(e?.message ?? 'Failed to load availability');
      }
    })();
    return () => {
      cancel = true;
    };
  }, [doctorId, date]);

  const disabledDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [{ before: today }];
  }, []);

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setServerMsg(null);
    setServerErr(null);
    try {
      const [hh, mm] = (selectedTime as string).split(':').map(Number);
      const start = new Date(date!);
      start.setHours(hh, mm, 0, 0);
      const end = new Date(start.getTime() + 90 * 60 * 1000); // 90 minutes

      await createAppointment({
        doctorId: doctorId!,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        reason: reason.trim(),
      });

      setServerMsg('Appointment created!');
      setReason('');
      setSelectedTime(null);
    } catch (e: any) {
      setServerErr(e?.message ?? 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-0">
      {/* controls */}
      <CardContent className="p-4 md:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          {/* doctor */}
          <div className="min-w-0">
            <label className="mb-1 block text-sm font-medium">Doctor</label>
            <Select
              onValueChange={(v) => setDoctorId(Number(v))}
              value={doctorId ? String(doctorId) : undefined}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={doctors.length ? 'Select a doctor' : 'No doctors available'}
                />
              </SelectTrigger>
              <SelectContent>
                {doctors.length === 0 ? (
                  <div className="text-muted-foreground px-2 py-1.5 text-sm">No doctors found</div>
                ) : (
                  doctors.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name ?? d.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* reason */}
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
      <CardContent className="p-0">
        <div className="grid gap-0 md:grid-cols-5">
          {/* Calendar (spans 3) */}
          <div className="min-w-0 p-4 md:col-span-3 md:p-6">
            <label className="mb-1 block text-sm font-medium">Date</label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              defaultMonth={date}
              showOutsideDays={false}
              disabled={disabledDays}
              className="bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
              formatters={{
                formatWeekdayName: (d) => d.toLocaleString('en-US', { weekday: 'short' }),
              }}
            />
          </div>
          <div className="border-t md:col-span-2 md:border-t-0 md:border-l">
            <div className="p-4 md:p-6">
              <div className="mb-2 text-sm font-medium">Times</div>
              {!doctorId || !date ? (
                <div className="text-muted-foreground text-sm">Pick a doctor and a date.</div>
              ) : serverErr ? (
                <div className="text-sm text-red-600">{serverErr}</div>
              ) : availableSlots.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No slots available for {fmtHumanDate(date)}.
                </div>
              ) : (
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
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t px-4 py-4 md:flex-row md:px-6">
        <div className="text-sm md:flex-1 md:self-center">
          {date && selectedTime ? (
            <>
              Selected <span className="font-medium">{fmtHumanDate(date)}</span> at{' '}
              <span className="font-medium">{selectedTime}</span>.
            </>
          ) : (
            <>Select a doctor, date and time.</>
          )}
        </div>
        <Button
          disabled={!canSubmit || submitting}
          onClick={submit}
          className="md:ml-auto"
          variant="outline"
        >
          {submitting ? 'Booking…' : 'Book'}
        </Button>
      </CardFooter>

      {(serverMsg || serverErr) && (
        <div className="px-6 pb-5">
          {serverMsg && <p className="text-sm text-green-600">{serverMsg}</p>}
          {serverErr && <p className="text-sm text-red-600">{serverErr}</p>}
        </div>
      )}
    </Card>
  );
}
