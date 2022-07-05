import { t } from 'gm-i18n'

function getPrinters() {
  return [
    {
      name: t('佳博'),
      isDefault: true,
      description: t('这只是示例数据，暂不支持网页版打印'),
    },
  ]
}

export { getPrinters }
