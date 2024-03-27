import { HttpException, HttpStatus } from '@nestjs/common';

const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export class EmailsValidation {
  static validateBulk(value: string[], name: string): string[] {
    if (!Array.isArray(value)) {
      throw new HttpException(`[${name}] should be an array of emails`, HttpStatus.BAD_REQUEST);
    }

    const invalidEmails = value.filter((email: string) => !validateEmail(email));

    if (invalidEmails.length) {
      throw new HttpException(
        { error: `[${name}] contains invalid emails`, emails: invalidEmails },
        HttpStatus.BAD_REQUEST,
      );
    }

    return value;
  }
}
