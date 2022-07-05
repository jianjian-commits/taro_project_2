import { t } from 'gm-i18n'

// 格式化线路
function formatRouteList({ id: value, name: text, addresses }) {
  return {
    value,
    text,
    children: addresses.map(({ resname: text, sid: value }) => ({
      value,
      text,
    })),
  }
}
// 格式化商品
function formatMerchantList(merchantList) {
  const map = {}

  merchantList.forEach((item) => {
    const {
      address_id: value,
      address_name: text,
      address_label_id,
      address_label_name,
    } = item
    if (!map[address_label_id]) {
      map[address_label_id] = {
        value: address_label_id ?? 0,
        text: address_label_name || t('（无标签）'),
        children: [],
      }
    }
    map[address_label_id].children.push({ value, text })
  })
  return Object.values(map)
}

export { formatRouteList, formatMerchantList }
