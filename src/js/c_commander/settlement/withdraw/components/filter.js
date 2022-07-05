import React, { Component } from 'react'
import { observer } from 'mobx-react'
import {
  DateRangePicker,
  BoxForm,
  FormBlock,
  FormItem,
  Input,
  Select,
  FormButton,
  Button,
  RightSideModal
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { WITHDRAW_STATUS } from 'common/enum'
import LevelListSelect from '../../../common/level_list_select'

import { store } from '../store'
import TaskList from '../../../../task/task_list'

const { More } = BoxForm
const withdrawStatus = [{ value: '', text: t('全部') }, ...WITHDRAW_STATUS]

@observer
class Filter extends Component {
  handleDateChange = (begin, end) => {
    const { mergeFilter } = store
    mergeFilter({ start_time: begin, end_time: end })
  }

  handleSearch = () => {
    store.doFirstRequest()
  }

  handleExport = () => {
    store.handleExport().then(() => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: { width: '300px' }
      })
    })
  }

  render() {
    const { filter } = store
    return (
      <>
        <BoxForm labelWidth='80px' btnPosition='left' colWidth='320px'>
          <FormBlock col={3}>
            <FormItem label={t('提现时间')}>
              <DateRangePicker
                begin={filter.start_time}
                end={filter.end_time}
                onChange={this.handleDateChange}
              />
            </FormItem>
            <FormItem label={t('搜索')}>
              <Input
                className='form-control'
                value={filter.q}
                onChange={e => store.mergeFilter({ q: e.target.value })}
                placeholder={t('输入社区门店/账号')}
              />
            </FormItem>

            <More>
              <FormBlock col={3}>
                <FormItem label={t('团长等级')}>
                  <LevelListSelect
                    selected={filter.level}
                    onSelect={value => {
                      store.mergeFilter({ level: value })
                    }}
                  />
                </FormItem>
                <FormItem label={t('审核状态')}>
                  <Select
                    value={filter.status || ''}
                    onChange={value =>
                      store.mergeFilter({ status: value || null })
                    }
                    data={withdrawStatus}
                  />
                </FormItem>
              </FormBlock>
            </More>
          </FormBlock>

          <FormButton>
            <Button
              type='primary'
              htmlType='submit'
              onClick={this.handleSearch}
            >
              {t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={this.handleExport}>{t('导出')}</Button>
          </FormButton>
        </BoxForm>
      </>
    )
  }
}

export default Filter
