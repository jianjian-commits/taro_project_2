import React from 'react'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import {
  Box,
  Form,
  FormItem,
  Select,
  Button,
  RightSideModal,
} from '@gmfe/react'
import { COMMANDER_STATUS } from 'common/enum'
import LevelListSelect from '../../../common/level_list_select'
import store from '../store'
import TaskList from '../../../../task/task_list'

const commanderStatus = [
  { value: '', text: i18next.t('全部状态') },
  ...COMMANDER_STATUS,
]

@observer
class Filter extends React.Component {
  handleSearch = () => {
    store.apiDoFirstRequest()
  }

  handleExport = () => {
    store.handleExport().then((res) => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  render() {
    const { levelSelected, check_status, q } = store.filter

    return (
      <Box hasGap>
        <Form inline onSubmit={this.handleSearch}>
          <FormItem label={i18next.t('团长等级')}>
            <LevelListSelect
              selected={levelSelected}
              onSelect={(selected) => {
                store.setValue(selected, 'levelSelected')
              }}
            />
          </FormItem>
          <FormItem label={i18next.t('状态')}>
            <Select
              data={commanderStatus}
              value={check_status}
              onChange={(value) => store.setValue(value, 'check_status')}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              value={q}
              placeholder={i18next.t('输入社区门店/账号')}
              onChange={(e) => store.setValue(e.target.value, 'q')}
            />
          </FormItem>
          <Button type='primary' htmlType='submit'>
            {i18next.t('搜索')}
          </Button>
          <Button className='gm-margin-left-10' onClick={this.handleExport}>
            {i18next.t('导出')}
          </Button>
        </Form>
      </Box>
    )
  }
}

export default Filter
