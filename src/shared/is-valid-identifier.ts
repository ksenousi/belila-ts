const isValidIdentifier = (str: string): boolean => /^[\w,\-]$/.test(str);
export default isValidIdentifier;
