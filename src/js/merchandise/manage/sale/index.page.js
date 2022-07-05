import { i18next, t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import store from './sale_card_store'
import manageStore from '../store'
import globalStore from '../../../stores/global'
import { BoxTable, Flex, Button } from '@gmfe/react'
import SaleCardsFilter from './component/sale_card_filter'
import CardTemplates from './component/templates'
import TableTotalText from 'common/components/table_total_text'
import { history, withRouter } from 'common/service'
import InitManageSale from '../../../guides/init/guide/init_manage_sale'
import InitBatchManageSale from '../../../guides/init/guide/init_batch_manage_sale'

@withRouter
@observer
class SaleMenu extends React.Component {
  componentDidMount() {
    manageStore.getServerTime()
    store.getSaleCards()
    store.getDefaultSaleMenu()
  }

  render() {
    const p_batchAddSku = globalStore.hasPermission('add_sku_batch')
    const p_addSaleMenu = globalStore.hasPermission('add_salemenu')
    const {
      location: {
        query: { guide_type },
      },
    } = this.props

    return (
      <>
        <SaleCardsFilter />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('报价单'),
                    content: store.cardList.length,
                  },
                ]}
              />
            </BoxTable.Info>
          }
          action={
            <Flex>
              {p_addSaleMenu && (
                <div data-id='initManageSale'>
                  <Button
                    type='primary'
                    onClick={() => {
                      history.push(
                        '/merchandise/manage/sale/menu?viewType=create'
                      )
                    }}
                    className='gm-margin-right-10'
                  >
                    {t('新建报价单')}
                  </Button>
                </div>
              )}
              {p_batchAddSku && (
                <Button
                  data-id='initBatchManageSale'
                  type='primary'
                  plain
                  onClick={() => {
                    history.push({
                      pathname: '/merchandise/manage/sale/batch',
                      query: {
                        guide_type:
                          guide_type === 'InitBatchManageSale'
                            ? 'InitSaleCheck'
                            : null,
                      },
                    })
                  }}
                >
                  {t('批量新建销售规格')}
                </Button>
              )}
            </Flex>
          }
        >
          <CardTemplates />
        </BoxTable>
        <InitManageSale ready />
        <InitBatchManageSale ready />
      </>
    )
  }
}

export default SaleMenu
