import BatchInventory from '../../../product/inventory/batch_inventory'
import { withBreadcrumbs } from 'common/service'
import { t } from 'gm-i18n'

// 只有净菜站点才会从这里进入
export default withBreadcrumbs([t('批量盘点')])(BatchInventory)
