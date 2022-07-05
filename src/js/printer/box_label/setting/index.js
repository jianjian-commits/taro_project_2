import { i18next } from 'gm-i18n'
import React, { useEffect } from 'react'
import { Flex, Button } from '@gmfe/react'
import { observer, Provider } from 'mobx-react'
import moment from 'moment'
import store from './store'
import Header from '../../components/setting/setting_header'
import MerchantList from '../../components/setting/merchant_list'
import _ from 'lodash'
import globalStore from '../../../stores/global'

const BoxLabelSetting = observer(
  ({
    location: {
      query: { id },
    },
  }) => {
    useEffect(() => {
      if (id) {
        store.setDetailId(id)
        store.getDetail()
      }
      return () => {
        store.reset()
      }
    }, [])

    const handleModify = () => {
      store.modify()
    }

    const handleCancel = () => {
      store.cancelModify()
    }

    const handleSave = () => {
      store.save()
    }

    const canEdit = globalStore.hasPermission('edit_box_template')
    const editStatus = store.viewType === 'edit'

    const { name, content, create_time } = store.detail
    const { type, size } = content.page
    const labelSize =
      type === 'DIY' && size
        ? `${_.trimEnd(size.width, 'm')}X${_.trimEnd(size.height, 'm')}`
        : type
    return (
      <Provider settingStore={store}>
        <div>
          <Header
            infos={[
              { label: i18next.t('模板名'), value: name },
              { label: i18next.t('打印规格'), value: labelSize },
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
                          onClick={handleCancel}
                        >
                          {i18next.t('取消')}
                        </Button>
                        <Button
                          type='primary'
                          htmlType='submit'
                          onClick={handleSave}
                        >
                          {i18next.t('保存')}
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Button
                          type='primary'
                          className='gm-margin-right-5'
                          onClick={handleModify}
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
          <Flex className='gm-padding-10'>
            <div
              style={{ width: '100%', border: '1px solid rgb(235, 238, 243)' }}
              className='gm-margin-10'
            >
              <MerchantList />
            </div>
          </Flex>
        </div>
      </Provider>
    )
  }
)

export default BoxLabelSetting
