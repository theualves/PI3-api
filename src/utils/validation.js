export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const toInt = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
};

export const toBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === "1") {
    return true;
  }

  if (value === "false" || value === "0") {
    return false;
  }

  return null;
};

export const toStringArray = (value) => {
  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = value
    .filter((item) => isNonEmptyString(item))
    .map((item) => item.trim());

  if (normalized.length !== value.length) {
    return null;
  }

  return [...new Set(normalized)];
};

export const isValidEmail = (value) =>
  isNonEmptyString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const sendValidationError = (res, fields, message = "Dados inválidos.") =>
  res.status(400).json({ error: message, fields });
