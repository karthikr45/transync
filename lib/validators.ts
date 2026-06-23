// Frontend validation rules. Aligned with the API Validation Reference
// doc: required fields, strong-password rule for create-user.

export const NAME_REGEX = /^([a-zA-Z'’]+\s)*[a-zA-Z'’]+$/;

// Same broad email shape the project uses on the mobile app. Backend
// also runs IsEmail validation; this is the client-side fast check.
export const EMAIL_REGEX =
  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

// Strong password: 8–16 chars, at least one lowercase, one uppercase,
// one digit and one special from @$!%*?&. Used by /users/create-user.
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

export function validatePassword(password: string): boolean {
  return STRONG_PASSWORD_REGEX.test(password);
}

export function passwordPolicy(password: string) {
  return {
    length: password.length >= 8 && password.length <= 16,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
    noSpaces: !/\s/.test(password),
  };
}

export function validName(s: string): boolean {
  if (!s || !s.trim()) return false;
  return NAME_REGEX.test(s.trim());
}

export function validEmail(s: string): boolean {
  if (!s || !s.trim()) return false;
  return EMAIL_REGEX.test(s.trim());
}
