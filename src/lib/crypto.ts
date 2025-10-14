/**
 * 使用 SHA-256 算法加密密码
 * @param password 明文密码
 * @returns 加密后的密码（十六进制字符串）
 */
export async function encryptPassword(password: string): Promise<string> {
  // 将字符串转换为 ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // 使用 SHA-256 进行加密
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // 将 ArrayBuffer 转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}
