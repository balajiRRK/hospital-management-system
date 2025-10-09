import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PersonalInformation() {
  return (
    <>
      {/* TODO: take borders out, it help me to understand what is going on with the CSS*/}
      <div className="m-auto w-full border pt-5">
        <FieldSet>
          <FieldLegend className="m-auto pb-5">Profile</FieldLegend>
          <FieldGroup className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input id="name" autoComplete="on" placeholder="Evil Rabbit" />
              <FieldDescription>Your full legal name</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="dob">Date of Birth</FieldLabel>
              <Input id="dob" type="date" />
            </Field>

            <div>
              {/*   Had to put the label and selector in div so that the label would be above and had to had margin for it to match grid */}
              <FieldLabel className="mb-3">Choose Gender</FieldLabel>
              <Field orientation="horizontal">
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Undefined">Undefined</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="photo">Profile Photo</FieldLabel>
              <Input id="photo" type="file" accept="image/*" />
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Contact</FieldLegend>
          <FieldGroup className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input id="phone" type="tel" />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" autoComplete="off" />
            </Field>

            <Field className="col-span-2">
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input id="address" placeholder="123 Main St" />
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Emergency Contact</FieldLegend>
          <FieldGroup className="grid grid-cols-2 gap-2">
            <Field>
              <FieldLabel htmlFor="emergency-name">Name</FieldLabel>
              <Input id="emergency-name" />
            </Field>

            <Field>
              <FieldLabel htmlFor="emergency-phone">Phone</FieldLabel>
              <Input id="emergency-phone" type="tel" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>
    </>
  );
}
