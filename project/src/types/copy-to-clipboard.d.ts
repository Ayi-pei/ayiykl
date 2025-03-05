declare module 'copy-to-clipboard' {
  interface Options {
    debug?: boolean;
    message?: string;
    format?: string;
    onCopy?: (clipboardData: object) => void;
  }

  function copy(text: string, options?: Options): boolean;
  export = copy;
}
