export const isObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

export const isNonEmptyString = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

export const isValidDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const hasDuplicateId = (error) => {
  return error?.code === 11000;
};
