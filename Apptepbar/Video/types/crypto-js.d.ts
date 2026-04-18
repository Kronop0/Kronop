declare module 'react-native-crypto-js' {
  export interface WordArray {
    toString(encoder?: Encoder): string;
    sigBytes: number;
    words: number[];
  }

  export interface Encoder {
    stringify(wordArray: WordArray): string;
    parse(str: string): WordArray;
  }

  export namespace enc {
    const Hex: Encoder;
    const Utf8: Encoder;
    const Base64: Encoder;
  }

  export function SHA256(message: string | WordArray): WordArray;
  export function HmacSHA256(message: string | WordArray, key: string | WordArray): WordArray;

  const CryptoJS: {
    SHA256: typeof SHA256;
    HmacSHA256: typeof HmacSHA256;
    enc: typeof enc;
  };

  export default CryptoJS;
}
