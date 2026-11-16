import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/** The date must be strictly later than the date in another property of the same object. */
export function IsAfterProperty(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfterProperty',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [otherProperty] = args.constraints as [string];
          const other = (args.object as Record<string, unknown>)[otherProperty];
          if (typeof value !== 'string' || typeof other !== 'string')
            return false;

          const date = new Date(value).getTime();
          const otherDate = new Date(other).getTime();
          // An unparseable other date is reported by its own @IsDateString, not here.
          if (Number.isNaN(otherDate)) return true;
          return !Number.isNaN(date) && date > otherDate;
        },
        defaultMessage(args?: ValidationArguments) {
          const [otherProperty] = (args?.constraints ?? ['']) as [string];
          return `${args?.property} must be after ${otherProperty}`;
        },
      },
    });
  };
}
