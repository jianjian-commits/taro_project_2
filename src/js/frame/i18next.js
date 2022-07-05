import { appTranslator, getCurrentLng } from 'gm-i18n'
import { setLocale } from '@gmfe/locales'
import { setLocale as setPrinterLocale } from 'gm-printer'
import { setLocale as setPrinterLabelLocale } from 'gm-printer-label'
import { setLocale as setGmCommonLocale } from '@gm-common/locales'
import locales from '../../locales'

// 初始化 库 的多语言设置
const lng = getCurrentLng()
appTranslator.loadSimplifiedChinese(locales.zh)
setLocale(lng)
setGmCommonLocale(lng)
setPrinterLocale(lng)
setPrinterLabelLocale(lng)
