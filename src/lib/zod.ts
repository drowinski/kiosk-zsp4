import { z } from 'zod';
import { applyDeclension } from '@/utils/language';

z.setErrorMap((issue, _ctx) => {
  let message = _ctx.defaultError;

  if (_ctx.defaultError === 'Required') {
    message = 'Wymagane.';
    return { message: message };
  }

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      break;
    case z.ZodIssueCode.invalid_literal:
      break;
    case z.ZodIssueCode.custom:
      break;
    case z.ZodIssueCode.invalid_union:
      break;
    case z.ZodIssueCode.invalid_union_discriminator:
      break;
    case z.ZodIssueCode.invalid_enum_value:
      break;
    case z.ZodIssueCode.unrecognized_keys:
      break;
    case z.ZodIssueCode.invalid_arguments:
      break;
    case z.ZodIssueCode.invalid_return_type:
      break;
    case z.ZodIssueCode.invalid_date:
      break;
    case z.ZodIssueCode.invalid_string:
      break;
    case z.ZodIssueCode.too_small:
      switch (issue.type) {
        case 'array':
          message = `Minimum ${issue.minimum} ${applyDeclension(Number(issue.minimum), 'element', 'elementy', 'elementów')}.`;
          break;
        case 'bigint':
          message = `Minimum ${issue.minimum}.`;
          break;
        case 'date':
          message = `Minimum ${issue.minimum}.`;
          break;
        case 'number':
          message = `Minimum ${issue.minimum}.`;
          break;
        case 'set':
          message = `Minimum ${issue.minimum} ${applyDeclension(Number(issue.minimum), 'element', 'elementy', 'elementów')}.`;
          break;
        case 'string':
          message = `Minimum ${issue.minimum} ${applyDeclension(Number(issue.minimum), 'znak', 'znaki', 'znaków')}.`;
          break;
      }
      break;
    case z.ZodIssueCode.too_big:
      switch (issue.type) {
        case 'array':
          message = `Maksimum ${issue.maximum} ${applyDeclension(Number(issue.maximum), 'element', 'elementy', 'elementów')}.`;
          break;
        case 'bigint':
          message = `Maksimum ${issue.maximum}.`;
          break;
        case 'date':
          message = `Maksimum ${issue.maximum}.`;
          break;
        case 'number':
          message = `Maksimum ${issue.maximum}.`;
          break;
        case 'set':
          message = `Maksimum ${issue.maximum} ${applyDeclension(Number(issue.maximum), 'element', 'elementy', 'elementów')}.`;
          break;
        case 'string':
          message = `Maksimum ${issue.maximum} ${applyDeclension(Number(issue.maximum), 'znak', 'znaki', 'znaków')}.`;
          break;
      }
      break;
    case z.ZodIssueCode.invalid_intersection_types:
      break;
    case z.ZodIssueCode.not_multiple_of:
      break;
    case z.ZodIssueCode.not_finite:
      break;
  }

  return { message: message };
});

export { z };
