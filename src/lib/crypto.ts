import { sha256 } from 'js-sha256';

/**
 * 使用 SHA-256 算法加密密码
 * @param password 明文密码
 * @returns 加密后的密码（十六进制字符串）
 */
export async function encryptPassword(password: string): Promise<string> {
  // 使用 js-sha256 库进行加密，兼容所有环境
  return sha256(password);
}
