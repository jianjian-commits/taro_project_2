import { i18next, t } from 'gm-i18n'
import React from 'react'
import { Observer, observer } from 'mobx-react'
import {
  Button,
  FormButton,
  FormItem,
  Form,
  Box,
  BoxTable,
  Tip,
  Modal,
  Flex,
  Price,
  InputNumber,
  Select,
  Option,
  InputNumberV2,
  Switch,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table, TableUtil } from '@gmfe/table'
import store from './store'
import commonStore from '../store'
import CreateMaterialModal from './create_material_modal'
import DeleteMaterialModal from './delete_material_result_modal'
import _ from 'lodash'
import Big from 'big.js'
import Permission from '../../common/components/permission'
const { OperationRowEdit, OperationDelete } = TableUtil
@observer
class List extends React.Component {
  componentDidMount() {
    store.setPagination(this.pagination)
    commonStore.fetchMaterilUnitName()
    store.pagination.doFirstRequest()
  }

  handleSearch = (e) => {
    store.pagination.doFirstRequest()
  }

  handleDelete = async (index) => {
    const deleteResult = await store.deleteMaterial(index)
    if (deleteResult === true) {
      Tip.success(i18next.t('删除成功!'))
      return
    }
    const { unit_name } = store.materialList[index]
    // typ === 4 要展示 unit_name
    const item = _.find(deleteResult, (item) => item.type === 4)
    if (item) {
      _.each(item.address, (addr) => {
        addr.unit_name = unit_name
      })
    }
    Modal.render({
      style: { width: '500px' },
      title: i18next.t('提示'),
      onHide: Modal.hide,
      children: <DeleteMaterialModal deleteResult={deleteResult} />,
    })
  }

  insertMaterial = (index, key, value) => {
    key === 'name'
      ? store.upadteMaterialList(index, key, value.target.value)
      : store.upadteMaterialList(index, key, value)
  }

  handleChange = (e) => {
    store.handleFilterChange({ q: e.target.value })
  }

  handleMaterialListChange = async (e) => {
    await store.handleMaterialListChange(e.index)
    this.insertMaterial(e.index, 'is_edit', false)
    Tip.success(i18next.t('修改成功！'))
  }

  handleCreate = () => {
    Modal.render({
      style: { width: '400px' },
      title: i18next.t('新建周转物'),
      onHide: Modal.hide,
      children: <CreateMaterialModal />,
    })
  }

  handleCancel = (index) => {
    this.insertMaterial(index, 'is_edit', false)
    this.pagination.doCurrentRequest()
  }

  render() {
    const canEdit = Permission.has('edit_turnover')
    const data = store.materialList.slice()
    return (
      <div>
        <Box hasGap>
          <Form inline>
            <FormItem label={i18next.t('搜索')}>
              <input
                type='text'
                className='form-control'
                placeholder={i18next.t('输入周转物名称或ID搜索')}
                onChange={this.handleChange}
              />
            </FormItem>
            <FormButton>
              <div className='gm-inline-block'>
                <Button type='primary' onClick={this.handleSearch}>
                  {i18next.t('搜索')}
                </Button>
                <div className='gm-gap-10' />
                <Button onClick={store.handleExport}>
                  {i18next.t('导出')}
                </Button>
              </div>
            </FormButton>
          </Form>
        </Box>

        <BoxTable
          action={
            <Permission field='add_turnover'>
              <Button type='primary' onClick={this.handleCreate}>
                {i18next.t('新建周转物')}
              </Button>
            </Permission>
          }
        >
          <ManagePaginationV2
            id='pagination_in_material_manage_list'
            disablePage
            onRequest={store.fetchMaterialList}
            ref={(ref) => (this.pagination = ref)}
          >
            <Table
              data={data}
              columns={[
                {
                  Header: i18next.t('周转物 ID'),
                  accessor: 'id',
                },
                {
                  Header: i18next.t('周转物名称'),
                  id: 'name',
                  Cell: (row) => {
                    const { original: material, index } = row
                    const { is_edit } = material
                    return (
                      <Observer>
                        {() => (
                          <Flex>
                            {is_edit && canEdit ? (
                              <input
                                className='form-control'
                                type='text'
                                value={material.name}
                                onChange={this.insertMaterial.bind(
                                  this,
                                  index,
                                  'name',
                                )}
                                maxLength='30'
                              />
                            ) : material.name ? (
                              <span>{material.name}</span>
                            ) : (
                              <span>-</span>
                            )}
                          </Flex>
                        )}
                      </Observer>
                    )
                  },
                },
                {
                  Header: i18next.t('单位'),
                  id: 'unit_name',
                  Cell: (row) => {
                    const { original: material, index } = row
                    const { is_edit, unit_name } = material
                    const tempList = JSON.stringify(
                      commonStore.materialUnitNameList,
                    )
                    material.is_materialUnitNameList = JSON.parse(tempList)
                    return (
                      <Observer>
                        {() => (
                          <Flex>
                            {is_edit && canEdit ? (
                              <Select
                                value={unit_name}
                                onChange={this.insertMaterial.bind(
                                  this,
                                  index,
                                  'unit_name',
                                )}
                                size='sm'
                              >
                                {_.map(
                                  material.is_materialUnitNameList,
                                  ({ text, value }) => {
                                    return (
                                      <Option key={value} value={value}>
                                        {text}
                                      </Option>
                                    )
                                  },
                                )}
                              </Select>
                            ) : (
                              unit_name && <span>{unit_name}</span>
                            )}
                          </Flex>
                        )}
                      </Observer>
                    )
                  },
                },
                {
                  Header: i18next.t('单个货值'),
                  id: 'price',
                  Cell: (row) => {
                    const { original: material, index } = row
                    const { is_edit, unit_name, price } = material
                    return (
                      <Observer>
                        {() => (
                          <Flex>
                            {is_edit && canEdit ? (
                              <InputNumber
                                style={{ width: '100px' }}
                                min={0}
                                max={999999999.99}
                                precision={2}
                                className='form-control'
                                value={price}
                                onChange={this.insertMaterial.bind(
                                  this,
                                  index,
                                  'price',
                                )}
                              />
                            ) : !(_.isNil(price) || price === '') ? (
                              <Flex>
                                <span>
                                  {Big(price).toFixed(2) +
                                    Price.getUnit() +
                                    '/' +
                                    unit_name}
                                </span>
                              </Flex>
                            ) : (
                              <Flex>
                                <span>-</span>
                              </Flex>
                            )}
                          </Flex>
                        )}
                      </Observer>
                    )
                  },
                },
                {
                  Header: i18next.t('同时作为称重框'),
                  id: 'is_weight',
                  Cell: (row) => {
                    const { original: material, index } = row
                    const { is_edit, is_weight } = material
                    return (
                      <Observer>
                        {() => (
                          <Flex>
                            {is_edit && canEdit ? (
                              <Switch
                                type='primary'
                                checked={!!is_weight}
                                on={i18next.t('是')}
                                off={i18next.t('否')}
                                onChange={this.insertMaterial.bind(
                                  this,
                                  index,
                                  'is_weight',
                                )}
                              />
                            ) : (
                              <span>{is_weight ? t('是') : t('否')}</span>
                            )}
                          </Flex>
                        )}
                      </Observer>
                    )
                  },
                },
                {
                  Header: i18next.t('重量'),
                  id: 'weight',
                  Cell: (row) => {
                    const { original: material, index } = row
                    const { is_edit, is_weight, weight } = material
                    return (
                      <Observer>
                        {() => (
                          <Flex>
                            {is_weight && is_edit && canEdit ? (
                              <InputNumberV2
                                style={{ width: '100px' }}
                                min={0}
                                max={999999999.99}
                                precision={2}
                                className='form-control'
                                value={weight}
                                onChange={this.insertMaterial.bind(
                                  this,
                                  index,
                                  'weight',
                                )}
                              />
                            ) : (
                              <span>{weight ?? '-'}</span>
                            )}
                          </Flex>
                        )}
                      </Observer>
                    )
                  },
                },
                {
                  Header: TableUtil.OperationHeader,
                  Cell: (row) => (
                    <Observer>
                      {() => (
                        <OperationRowEdit
                          isEditing={!!data[row.index].is_edit}
                          onClick={this.insertMaterial.bind(
                            this,
                            row.index,
                            'is_edit',
                            true,
                          )}
                          onSave={this.handleMaterialListChange.bind(this, row)}
                          onCancel={this.handleCancel.bind(this, row.index)}
                        >
                          <Permission field='delete_turnover'>
                            <OperationDelete
                              title='删除'
                              onClick={this.handleDelete.bind(this, row.index)}
                            >
                              是否确认删除此周转物
                            </OperationDelete>
                          </Permission>
                        </OperationRowEdit>
                      )}
                    </Observer>
                  ),
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}

export default List
