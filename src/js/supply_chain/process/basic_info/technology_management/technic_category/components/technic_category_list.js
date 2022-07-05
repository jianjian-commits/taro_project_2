import React from 'react'
import { observer } from 'mobx-react'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import store from '../store'
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
import { getStrByte } from 'common/util'

const { OperationHeader, OperationCell, OperationDelete } = TableXUtil

const NewModal = observer(() => {
  const { name } = store.newCategoryDetail

  const handleInputChange = (e) => {
    store.changeCategoryDetail('name', e.target.value)
  }

  return (
    <Form>
      <FormItem label={t('类型名称')}>
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

const NewCategory = observer(() => {
  const handleEnsure = () => {
    const { name } = store.newCategoryDetail

    if (_.isNil(name) || name === '') {
      return Promise.reject(Tip.warning(t('请输入类型名称')))
    }

    if (getStrByte(name) > 20) {
      return Promise.reject(
        Tip.warning(t('类型名称不要超过10个汉字或20个英文、数字'))
      )
    }

    return store.newTechnicCategory().then(() => {
      store.fetchTechnicCategoryList()
      store.clearNew()
    })
  }

  const handleNew = () => {
    Dialog.confirm({
      title: t('新建工艺类型'),
      children: <NewModal />,
      onHide: Dialog.hide,
      onOK: handleEnsure,
    })
  }
  return (
    <Button onClick={handleNew} type='primary'>
      {t('新建类型')}
    </Button>
  )
})

const TechnicCategoryList = observer(() => {
  const { technicCategoryList } = store

  const handleDel = (id) => {
    store.deleteTechnicCategory(id).then(() => {
      store.fetchTechnicCategoryList()
    })
  }

  const columns = [
    {
      Header: t('类型名称'),
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
            title={t('删除工艺类型')}
          >
            {t('是否确定要删除该工艺类型？')}
          </OperationDelete>
        </OperationCell>
      ),
    },
  ]
  return (
    <BoxTable action={<NewCategory />}>
      <TableX data={technicCategoryList.slice()} columns={columns} />
    </BoxTable>
  )
})

export default TechnicCategoryList
