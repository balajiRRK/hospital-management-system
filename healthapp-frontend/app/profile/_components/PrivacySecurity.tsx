import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export default function PrivacySecurity() {
  return (
    <>
      {' '}
      {/* TODO: take borders out, it help me to understand what is going on with the CSS*/}
      <div className="m-auto w-full border pt-5">
        <FieldSet>
          <FieldLegend className="m-auto pb-5" >Reset Password</FieldLegend>
          <FieldGroup className="grid grid-cols-1 gap-2">
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <Input id="password" type="password" />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <Input id="confirm-password" type="password" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>
    </>
  );
}
