

/**
 * 
 * Adds leading zeroes to the string
 * 
 * @param { number } size 
 * 
 * @returns { string | undefined }
 */
export function zFill(num, size) {
  try {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  } catch {
    return undefined
  }
}
