import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Box,
  Form,
  FormItem,
  FormButton,
  DatePicker,
  RightSideModal,
  Tip,
  Flex,
  Button,
} from '@gmfe/react'
import { Request } from '@gm-common/request'
import moment from 'moment'
import TaskList from '../../task/task_list'

class PackageDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      date: new Date(),
    }

    this.handleChangeDate = ::this.handleChangeDate
    this.handleExport = ::this.handleExport
  }

  handleChangeDate(date) {
    this.setState({ date })
  }

  handleExport() {
    Request('/weight/package/async_export')
      .data({ date: moment(this.state.date).format('YYYY-MM-DD') })
      .get()
      .then((json) => {
        if (json.data && json.data.task_id) {
          Tip.success(i18next.t('正在异步导出报表...'))
          RightSideModal.render({
            children: <TaskList />,
            onHide: RightSideModal.hide,
            style: {
              width: '300px',
            },
          })
        }
      })
  }

  render() {
    return (
      <Box hasGap>
        <Form onSubmit={this.handleExport} inline>
          <FormItem label={i18next.t('打包时间')}>
            <Flex flex none column>
              <DatePicker
                date={this.state.date}
                placeholder={i18next.t('选择打包时间：')}
                onChange={this.handleChangeDate}
              />
            </Flex>
          </FormItem>
          <FormButton>
            <Button htmlType='submit'>{i18next.t('导出')}</Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

export default PackageDetail
