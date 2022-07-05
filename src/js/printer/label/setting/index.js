import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Button } from '@gmfe/react'
import { observer, Provider } from 'mobx-react'
import MerchantList from '../../components/setting/merchant_list'
import SpuList from '../../components/setting/spu_list'
import Header from '../../components/setting/setting_header'

import labelSettingStore from './store'

import moment from 'moment'
import globalStore from '../../../stores/global'
import TableListTips from '../../../common/components/table_list_tips'

@observer
class LabelSetting extends React.Component {
  componentDidMount() {
    const { id } = this.props.location.query
    if (id) {
      labelSettingStore.setDetailId(id)
      labelSettingStore.getDetail()
    }
  }

  componentWillUnmount() {
    labelSettingStore.reset()
  }

  handleCancel() {
    labelSettingStore.cancelModify()
  }

  handleSave() {
    labelSettingStore.save()
  }

  handleModify() {
    labelSettingStore.modify()
  }

  render() {
    const {
      viewType,
      detail: { content, create_time },
    } = labelSettingStore
    const editStatus = viewType === 'edit'
    const canEdit = globalStore.hasPermission('edit_print_tag')

    return (
      <Provider settingStore={labelSettingStore}>
        <div>
          <Header
            infos={[
              { label: i18next.t('模板名'), value: content.name },
              { label: i18next.t('打印规格'), value: content.page.type },
              {
                label: i18next.t('打印时间'),
                value: !create_time
                  ? '-'
                  : moment(create_time).format('YYYY-MM-DD HH:mm'),
              },
            ]}
            actions={
              <>
                {!!canEdit && (
                  <Flex>
                    {editStatus ? (
                      <div>
                        <Button
                          className='gm-margin-right-5'
                          onClick={this.handleCancel}
                        >
                          {i18next.t('取消')}
                        </Button>
                        <Button
                          type='primary'
                          htmlType='submit'
                          onClick={this.handleSave}
                        >
                          {i18next.t('保存')}
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Button
                          type='primary'
                          className='gm-margin-right-5'
                          onClick={this.handleModify}
                        >
                          {i18next.t('修改')}
                        </Button>
                      </div>
                    )}
                  </Flex>
                )}
              </>
            }
          />

          <TableListTips
            tips={[
              i18next.t(
                '若商户下所有商品均使用同一模板，则只需添加商户无需添加商品；若仅某些商品使用该模板，则需添加商户且在右侧添加对应商品。'
              ),
            ]}
          />
          <Flex className='gm-padding-10'>
            <div
              style={{ width: '100%', border: '1px solid rgb(235, 238, 243)' }}
              className='gm-margin-10'
            >
              <MerchantList />
            </div>
            <div
              style={{ width: '100%', border: '1px solid rgb(235, 238, 243)' }}
              className='gm-margin-10'
            >
              <SpuList />
            </div>
          </Flex>
        </div>
      </Provider>
    )
  }
}

export default LabelSetting
