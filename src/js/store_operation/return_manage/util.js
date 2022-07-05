import { i18next } from 'gm-i18n'
// 获取退货状态对应的文字
const refundStateText = {
  0: i18next.t('处理方式'),
  4: i18next.t('二次入库'),
  5: i18next.t('放弃取货'),
}

export { refundStateText }
