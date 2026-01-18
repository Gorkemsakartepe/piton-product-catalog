export function validateEmail(email: string) {
  if (!email.trim()) return "E-mail zorunludur";
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!ok) return "Geçerli bir e-mail giriniz";
  return null;
}

export function validatePassword(password: string) {
  if (!password.trim()) return "Şifre zorunludur";

  if (password.length < 6 || password.length > 20) {
    return "Şifre 6-20 karakter olmalıdır";
  }

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return "Şifre en az 1 harf ve 1 rakam içermelidir";
  }

  return null;
}

export function validateName(value: string, label: string) {
  const v = value.trim();
  if (!v) return `${label} zorunludur`;
  if (v.length < 2) return `${label} en az 2 karakter olmalıdır`;
  return null;
}

/**
 * Phone is kept as 10 digits only: 5xxxxxxxxx
 * UI renders as: +90(505) 888-88-88
 */
export function validatePhone(phoneDigits: string) {
  const digits = phoneDigits.replace(/\D/g, "");

  if (!digits) return "Telefon numarası zorunludur";
  if (digits.length !== 10) return "Telefon numarası 10 hane olmalıdır (5xx...)";
  if (!digits.startsWith("5")) return "Telefon 5 ile başlamalıdır";

  return null;
}

export function validatePasswordConfirm(password: string, confirm: string) {
  if (!confirm.trim()) return "Şifre tekrar zorunludur";
  if (password !== confirm) return "Şifreler uyuşmuyor";
  return null;
}
