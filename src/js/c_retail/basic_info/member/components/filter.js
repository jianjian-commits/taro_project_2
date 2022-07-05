import React from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  FormBlock,
  FormItem,
  FormButton,
  DateRangePicker,
  Select,
  RightSideModal,
  Button
} from '@gmfe/react'
import { observer } from 'mobx-react'
import TaskList from '../../../../task/task_list'

import store from '../store'
import globalStore from '../../../../stores/global'
import AreaSelect from '../../../../common/components/area_select'

@observer
class Filter extends React.Component {
  componentDidMount() {
    store.getUserLabelList({ limit: 0 })
  }

  handleTextChange = e => {
    const { value, name } = e.target
    store.setUserFilter(name, value)
  }

  handleSearch = () => {
    store.doMemberFirstRequest()
  }

  handleSelectChange = (value, name) => {
    store.setUserFilter(name, value)
  }

  handleAreaSelect = citySelected => {
    store.setUserFilter('area_data', citySelected)
  }

  handleExport = () => {
    store.exportUserInfoList().then(json => {
      // 异步任务
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px'
        }
      })
    })
  }

  render() {
    const { fliter_label, user_filter } = store
    const { begin, end, search_text, user_label } = user_filter

    return (
      <BoxForm
        btnPosition='left'
        labelWidth='80px'
        colWidth='370px'
        onSubmit={this.handleSearch}
      >
        <FormBlock col={3}>
          <FormItem label={t('按注册时间')}>
            <DateRangePicker
              begin={begin}
              end={end}
              canClear
              onChange={(begin, end) => {
                store.setUserFilter('begin', begin)
                store.setUserFilter('end', end)
              }}
              enabledTimeSelect
            />
          </FormItem>
          <FormItem label={t('按客户信息')}>
            <input
              type='text'
              value={search_text}
              name='search_text'
              className='form-control'
              placeholder={t('输入客户信息搜索')}
              onChange={this.handleTextChange}
            />
          </FormItem>
        </FormBlock>

        <BoxForm.More>
          <FormBlock col={3}>
            <FormItem label={t('客户标签')}>
              <Select
                value={user_label}
                data={fliter_label.slice()}
                onChange={value => this.handleSelectChange(value, 'user_label')}
              />
            </FormItem>
            <FormItem label={t('地理标签')}>
              <AreaSelect onSelect={this.handleAreaSelect} />
            </FormItem>
          </FormBlock>
        </BoxForm.More>

        <FormButton>
          <Button htmlType='submit' type='primary'>
            {t('搜索')}
          </Button>
          {globalStore.hasPermission('export_customer_information') && (
            <>
              <div className='gm-gap-10' />
              <Button type='default' onClick={this.handleExport}>
                {t('导出')}
              </Button>
            </>
          )}
        </FormButton>
      </BoxForm>
    )
  }
}

export default Filter
