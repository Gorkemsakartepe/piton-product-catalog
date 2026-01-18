export function validateEmail(email: string) {
  if (!email.trim()) return "Email zorunludur";
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!ok) return "Geçerli bir email giriniz";
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
