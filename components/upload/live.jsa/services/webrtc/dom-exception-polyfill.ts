// DOMException polyfill for LiveKit client in React Native
class DOMExceptionPolyfill extends Error {
  constructor(message: string = '', name: string = 'Error') {
    super(message);
    this.name = name;

    // Map name to code
    const nameToCode: Record<string, number> = {
      'IndexSizeError': 1,
      'DOMStringSizeError': 2,
      'HierarchyRequestError': 3,
      'WrongDocumentError': 4,
      'InvalidCharacterError': 5,
      'NoDataAllowedError': 6,
      'NoModificationAllowedError': 7,
      'NotFoundError': 8,
      'NotSupportedError': 9,
      'InUseAttributeError': 10,
      'InvalidStateError': 11,
      'SyntaxError': 12,
      'InvalidModificationError': 13,
      'NamespaceError': 14,
      'InvalidAccessError': 15,
      'ValidationError': 16,
      'TypeMismatchError': 17,
      'SecurityError': 18,
      'NetworkError': 19,
      'AbortError': 20,
      'URLMismatchError': 21,
      'QuotaExceededError': 22,
      'TimeoutError': 23,
      'InvalidNodeTypeError': 24,
      'DataCloneError': 25,
    };

    (this as any).code = nameToCode[name] || 0;
  }

  // Instance code property
  get code(): number {
    return (this as any).code;
  }
}

// Set DOMException globally immediately
globalThis.DOMException = DOMExceptionPolyfill as any;
if (typeof global !== 'undefined') {
  global.DOMException = DOMExceptionPolyfill as any;
}

export default DOMExceptionPolyfill;
