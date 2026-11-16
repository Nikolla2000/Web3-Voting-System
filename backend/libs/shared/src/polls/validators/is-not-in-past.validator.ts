import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * The date may not be in the past, allowing `graceMinutes` of slack: a client that picks "now"
 * and then spends a few minutes on the rest of the form (or has a slightly skewed clock) still
 * means "start immediately", not "backdate this".
 */
export function IsNotInPast(
  graceMinutes: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotInPast',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [graceMinutes],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return false;

          const [grace] = args.constraints as [number];
          return date.getTime() >= Date.now() - grace * 60 * 1000;
        },
        defaultMessage(args?: ValidationArguments) {
          return `${args?.property} must not be in the past`;
        },
      },
    });
  };
}
