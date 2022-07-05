import { i18next } from 'gm-i18n'

const insertBlocksConfig = [
  { value: '', text: i18next.t('文本') },
  { value: 'line', text: i18next.t('线条') },
  { value: 'image', text: i18next.t('图片') },
  { value: 'package_id_qrcode', text: i18next.t('验货二维码') },
  { value: 'barcode', text: i18next.t('验货条形码') },
  { value: 'diycode', text: i18next.t('自定义编码条形码') },
]

export default insertBlocksConfig
