import React, { Component } from 'react'
import { observer } from 'mobx-react'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  DateRangePicker,
  Button,
  RightSideModal,
  Select,
  Flex,
} from '@gmfe/react'
import { t } from 'gm-i18n'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import store from '../store'
import TaskList from '../../../task/task_list'

const selectOptionsList = [
  {
    value: 'order_time',
    text: '按未下单时间',
  },
  {
    value: 'receive_begin_time',
    text: '按未收货时间',
  },
]

@observer
class Filter extends Component {
  componentDidMount() {
    const { begin } = this.props.location.query
    begin && store.mergeFilter({ begin: moment(begin) })
  }

  handleChange = (value, key) => {
    const { mergeFilter } = store
    mergeFilter({ [key]: value })
  }

  handleSearch = () => {
    store.setFilter({})
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
    const {
      filter: { begin, end, dataType },
    } = store

    return (
      <Box hasGap>
        <Form
          inline
          colWidth='400px'
          labelWidth='80px'
          onSubmit={this.handleSearch}
        >
          <FormItem>
            <Flex>
              <Select
                clean
                className='gm-margin-right-5'
                style={{ minWidth: '110px' }}
                data={selectOptionsList}
                value={dataType}
                onChange={(value) => {
                  this.handleChange(value, 'dataType')
                }}
              />
              <DateRangePicker
                style={{ minWidth: '280px' }}
                begin={begin}
                end={end}
                enabledTimeSelect
                onChange={(begin, end) => {
                  this.handleChange(begin, 'begin')
                  this.handleChange(end, 'end')
                }}
              />
            </Flex>
          </FormItem>

          <FormButton>
            <Button type='primary' htmlType='submit'>
              {t('搜索')}
            </Button>
            <div className='gm-gap-10' />
            <Button onClick={this.handleExport}>{t('导出')}</Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

export default withRouter(Filter)
