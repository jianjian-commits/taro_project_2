import React from 'react'
import { observer } from 'mobx-react'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import store from './store'
import {
  BoxTable,
  Button,
  Input,
  Dialog,
  FormItem,
  Form,
  Tip,
} from '@gmfe/react'
import _ from 'lodash'
import { useEffect } from 'react'
import { getStrByte } from 'common/util'

const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

const NewModal = observer(() => {
  const { name } = store.newLabelDetail

  useEffect(() => {
    return () => store.changeLabelDetail('name', '')
  }, [])

  const handleInputChange = (e) => {
    store.changeLabelDetail('name', e.target.value)
  }

  return (
    <Form>
      <FormItem label={t('标签名称')}>
        <Input
          className='form-control'
          maxLength={20}
          type='text'
          value={name}
          style={{ width: '220px' }}
          placeholder={t('请输入10个汉字或20个英文、数字')}
          onChange={handleInputChange}
        />
      </FormItem>
    </Form>
  )
})

const NewLabel = observer(() => {
  const handleEnsure = () => {
    const { name } = store.newLabelDetail

    if (_.isNil(name) || name === '') {
      return Promise.reject(Tip.warning(t('请输入标签名称')))
    }

    if (getStrByte(name) > 20) {
      return Promise.reject(
        Tip.warning(t('标签名称不要超过10个汉字或20个英文、数字'))
      )
    }

    return store.newLabel().then(() => {
      store.fetchList()

      store.clearNew()
    })
  }

  const handleNew = () => {
    Dialog.confirm({
      title: t('新建商品加工标签'),
      children: <NewModal />,
      onHide: Dialog.hide,
      onOK: handleEnsure,
    })
  }
  return (
    <Button onClick={handleNew} type='primary'>
      {t('新建标签')}
    </Button>
  )
})

const ProcessLabelList = observer(() => {
  const { list } = store

  const handleDel = (id) => {
    store.deleteLabel(id).then(() => {
      store.fetchList()
    })
  }

  const columns = [
    {
      Header: t('标签名称'),
      accessor: 'name',
    },
    {
      width: 90,
      Header: OperationHeader,
      accessor: 'operate',
      Cell: (cellProps) => (
        <OperationCell>
          <OperationDelete
            onClick={() => handleDel(cellProps.row.original.id)}
            title={t('删除商品加工标签')}
          >
            {t('是否确定要删除该商品加工标签？')}
          </OperationDelete>
        </OperationCell>
      ),
    },
  ]
  return (
    <BoxTable action={<NewLabel />}>
      <TableX data={list.slice()} columns={columns} />
    </BoxTable>
  )
})

export default ProcessLabelList
