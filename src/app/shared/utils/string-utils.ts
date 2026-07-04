export function uppercaseStrings(obj: any): any {
  if (typeof obj === 'string') {
    return obj.toUpperCase();
  }
  if (Array.isArray(obj)) {
    return obj.map(uppercaseStrings);
  }
  if (obj && typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      res[key] = uppercaseStrings(obj[key]);
    }
    return res;
  }
  return obj;
}
