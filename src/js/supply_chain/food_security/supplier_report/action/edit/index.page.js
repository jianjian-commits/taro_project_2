import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { store } from '../store'
import { withRouter } from 'common/service'
import { t } from 'gm-i18n'
import {
  Button,
  DatePicker,
  Dialog,
  Form,
  FormItem,
  FormPanel,
  Input,
  Popover,
  Tip,
} from '@gmfe/react'
import { noop, flatten } from 'lodash'
import { TableX } from '@gmfe/table-x'
import global from 'stores/global'
import Add from '../add/index.page'
import batchStore from '../add/components/batch_table/index.store'

@withRouter
@observer
class Edit extends Component {
  static propTypes = {
    location: PropTypes.object,
  }

  static formItem = [
    {
      label: t('报告编号'),
      renderItem: () => `JD${store.editInfo.id}`,
    },
    { label: t('报告名称'), key: 'report_name' },
    { label: t('检测日期'), key: 'detect_date' },
    { label: t('送检机构'), key: 'detect_sender' },
    { label: t('检测机构'), key: 'detect_institution' },
    { label: t('检测人'), key: 'detector' },
    {
      label: t('有效状态'),
      renderItem: () => {
        const {
          editInfo: { status },
        } = store
        const map = {
          1: t('有效'),
          2: t('失效'),
        }
        return map[status] || '-'
      },
    },
  ]

  componentDidMount() {
    const {
      location: {
        query: { id },
      },
    } = this.props
    store.fetchEditInfo(id).catch((error) => {
      Dialog.confirm({
        title: t('警告'),
        children: error.message,
        cancelBtn: false,
      })
    })
  }

  handleDelete = () => {
    const {
      location: {
        query: { id },
      },
    } = this.props
    Dialog.confirm({
      title: t('警告'),
      children: t('确定删除该检测报告吗？'),
      onOK: () =>
        store.deleteReport(id).then(() => {
          Tip.success(t('删除成功'))
          window.closeWindow()
        }),
    })
  }

  handleEdit = () => {
    store.setEdit(true)
    const {
      editInfo: {
        id,
        report_name,
        detect_date,
        detect_sender,
        detect_institution,
        detector,
        status,
        spus,
        expiring_time,
        pictures,
      },
    } = store
    store.setAllFilter({
      id,
      report_name,
      detect_date: new Date(detect_date),
      detect_sender,
      detect_institution,
      detector,
      status,
    })
    store.setImages(pictures.map((item) => item.picture))
    store.imageFiles = pictures.map((item) => ({
      url: item.picture,
      id: item.picture_id,
    }))
    store.setSelected(spus.map((item) => item.spu_id))
    if (expiring_time) {
      store.setBindProduct(1)
      store.setValidity(new Date(expiring_time))
    } else {
      store.setBindProduct(0)
      const batch_numbers = flatten(
        spus.map((spu) => spu.batches.map((batch) => batch.batch_number)),
      )
      batchStore.fetchList(batch_numbers)
    }
  }

  render() {
    const { editInfo, edit } = store
    const { expiring_time } = editInfo
    if (edit) {
      return <Add />
    }

    const columns = [
      { Header: t('一级分类'), accessor: 'category1_name' },
      { Header: t('二级分类'), accessor: 'category2_name' },
      { Header: t('商品名'), accessor: 'name' },
      {
        Header: t('批次'),
        accessor: 'batches',
        Cell: ({
          row: {
            original: { batches },
          },
        }) => {
          const { stock_method } = global.user
          if (stock_method === 2 && batches?.length) {
            return (
              <Popover
                popup={
                  <div className='gm-padding-15 gm-bg'>
                    {batches.map((item, index) => (
                      <p key={index}>{item.batch_number}</p>
                    ))}
                  </div>
                }
              >
                <span className='text-primary gm-cursor'>{t('查看批次')}</span>
              </Popover>
            )
          }
          return '-'
        },
      },
    ]

    if (expiring_time) {
      columns[3] = {
        Header: t('有效期'),
        accessor: 'expiring_time',
        Cell: () => (
          <DatePicker
            style={{ width: '220px' }}
            onChange={noop}
            date={new Date(expiring_time)}
            disabled
          />
        ),
      }
    }

    return (
      <>
        <FormPanel
          title={t('检测报告')}
          right={
            <div>
              <Button
                type='primary'
                onClick={this.handleEdit}
                className='gm-margin-right-10'
              >
                {t('编辑')}
              </Button>
              <Button onClick={this.handleDelete}>{t('删除')}</Button>
            </div>
          }
        >
          <Form labelWidth='90px'>
            {Edit.formItem.map((item, index) => (
              <FormItem label={item.label} key={index}>
                <Input
                  value={
                    item.renderItem ? item.renderItem() : editInfo[item.key]
                  }
                  className='form-control'
                  disabled
                />
              </FormItem>
            ))}
          </Form>
        </FormPanel>
        <FormPanel title={t('检测商品')}>
          <TableX
            data={editInfo.spus.slice() || []}
            columns={columns}
            style={{ maxHeight: '500px' }}
            className='gm-margin-bottom-20'
          />
        </FormPanel>
        <FormPanel title={t('检测报告')}>
          {editInfo?.pictures.map((item, index) => (
            <img
              src={item.picture}
              alt=''
              key={index}
              className='b-testing-information-image'
            />
          ))}
        </FormPanel>
      </>
    )
  }
}

export default Edit
