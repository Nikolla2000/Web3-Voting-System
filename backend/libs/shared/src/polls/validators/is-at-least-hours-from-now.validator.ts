import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsAtLeastHoursFromNow(
  hours: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAtLeastHoursFromNow',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [hours],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return false;

          const [minHours] = args.constraints as [number];
          return date.getTime() >= Date.now() + minHours * 60 * 60 * 1000;
        },
        defaultMessage(args?: ValidationArguments) {
          const [minHours] = (args?.constraints ?? [0]) as [number];
          return `${args?.property} must be at least ${minHours} hours from now`;
        },
      },
    });
  };
}
