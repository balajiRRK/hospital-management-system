import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export default function HealthMetrics() {
  return (
    <>
      {/* TODO: take borders out, it help me to understand what is going on with the CSS*/}
      <div className="m-auto w-full border pt-5">
        <FieldSet>
          <FieldLegend className="m-auto pb-5">Health Metrics</FieldLegend>
          <FieldGroup className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="weight">Weight</FieldLabel>
              <Input id="weight" type="number" step="1" />
            </Field>

            <Field>
              <FieldLabel htmlFor="height">Height</FieldLabel>
              <Input id="height" type="number" step="0.1" />
            </Field>

            <Field>
              <FieldLabel htmlFor="bmi">BMI</FieldLabel>
              <Input id="bmi" type="number" step="0.1" disabled />
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>
    </>
  );
}
