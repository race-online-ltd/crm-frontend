function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function buildMultipartFormData(payload) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value) && value.every((item) => item instanceof File)) {
      value.forEach((file) => {
        formData.append(key, file);
      });
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    if (value instanceof Date) {
      formData.append(key, value.toISOString());
      return;
    }

    if (Array.isArray(value) || isPlainObject(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}
