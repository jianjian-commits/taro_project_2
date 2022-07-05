declare module 'gm-i18n' {
  function t(text: string, config?: { [key: string]: string }): string

  class i18next {
    static t(text: string, config?: { [key: string]: string }): string
  }

  export { t, i18next }
}
