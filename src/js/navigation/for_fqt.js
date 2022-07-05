import { i18next } from 'gm-i18n'

const navConfig = [
  {
    link: '/fqt',
    name: 'FQT',
    sub: [
      {
        name: i18next.t('nav__管理'),
        sub: [{ link: '/fqt/trace/spu', name: i18next.t('nav__SPU追溯') }],
        link: '/fqt/trace'
      }
    ]
  }
]

export default navConfig
