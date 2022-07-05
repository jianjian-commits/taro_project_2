import React, { useEffect } from 'react'
import { SvgWarningCircle } from 'gm-svg'
import {
  FormItem,
  Form,
  Tip,
  Dialog,
  Select,
  FormButton,
  Input,
  RightSideModal,
  Popover,
  Flex,
  Button,
  FormPanel,
} from '@gmfe/react'
import { observer } from 'mobx-react'
import { history } from 'common/service'
import store from '../store/receipt_store'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import {
  fixedColumnsTableXHOC,
  editTableXHOC,
  TableX,
  TableXUtil,
} from '@gmfe/table-x'
import { KCInput, keyboardTableXHOC, KCSelect } from '@gmfe/keyboard'
import ParamsSettingModal from './params_setting_modal'
import { PARAM_TYPE_ENUM } from 'common/enum'
import styled from 'styled-components'
import HeaderTip from 'common/components/header_tip'

const TipStyled = styled.span`
  color: #f00;
`

const { OperationHeader, EditOperation, TABLE_X } = TableXUtil

const KeyboardEditTableX = keyboardTableXHOC(
  fixedColumnsTableXHOC(editTableXHOC(TableX))
)

const FieldNameCell = observer(({ index }) => {
  const { customColsList } = store
  const { col_name, params } = customColsList[index]

  const handleInputChange = (event) => {
    const changeData = {}
    changeData[event.target.name] = event.target.value

    store.changeCustomColsListItem(index, changeData)
  }

  const isInvalidFieldName = !col_name.trim() && params.length > 0

  return (
    <Flex alignCenter>
      <KCInput
        type='text'
        name='col_name'
        autoComplete='off'
        value={col_name}
        maxLength={20}
        onChange={handleInputChange}
      />
      {isInvalidFieldName && (
        <Popover
          showArrow
          component={<div />}
          type='hover'
          popup={
            <div
              className='gm-border gm-padding-5 gm-bg gm-text-12'
              style={{ width: '100px' }}
            >
              {i18next.t('请输入字段名称，否则字段参数将不保存')}
            </div>
          }
        >
          <span>
            <SvgWarningCircle style={{ color: 'red' }} />
          </span>
        </Popover>
      )}
    </Flex>
  )
})

const FieldParamsCell = observer(({ index }) => {
  const { params, col_type } = store.customColsList[index]
  const canSetParams = col_type === 0

  const handleOpenParamsSetting = () => {
    RightSideModal.render({
      children: <ParamsSettingModal index={index} />,
      onHide: RightSideModal.hide,
      title: i18next.t('字段参数列表'),
    })
  }

  return (
    <>
      {canSetParams ? (
        <a onClick={handleOpenParamsSetting}>{`${i18next.t('参数设置')}（${
          params.length
        }）`}</a>
      ) : (
        i18next.t('参数设置')
      )}
    </>
  )
})

const SelectCell = observer(({ index }) => {
  const { col_type } = store.customColsList[index]

  const handleChangeSelect = (index, selected) => {
    store.changeCustomColsListItem(index, { col_type: selected })
  }

  return (
    <KCSelect
      data={PARAM_TYPE_ENUM}
      value={col_type}
      onChange={(value) => handleChangeSelect(index, value)}
    />
  )
})

const CustomTableCell = observer(() => {
  const { customColsList } = store

  const handleAddCustomItem = () => {
    store.addCustomItem()
  }

  const handleDeleteCustomItem = (index) => {
    store.deleteCustomItem(index)
  }

  return (
    <KeyboardEditTableX
      id='custom'
      tiled
      onAddRow={handleAddCustomItem}
      data={customColsList.slice()}
      columns={[
        {
          Header: i18next.t('序号'),
          accessor: 'num',
          width: TABLE_X.WIDTH_NO,
          fixed: 'left',
          Cell: ({ row: { index } }) => {
            return index + 1
          },
        },
        {
          Header: OperationHeader,
          accessor: 'operation',
          width: TABLE_X.WIDTH_OPERATION,
          fixed: 'left',
          // eslint-disable-next-line react/prop-types
          Cell: ({ row: { index } }) => {
            return (
              <EditOperation
                onAddRow={handleAddCustomItem}
                onDeleteRow={
                  customColsList.length === 1
                    ? undefined
                    : () => handleDeleteCustomItem(index)
                }
              />
            )
          },
        },
        {
          Header: i18next.t('字段名称'),
          accessor: 'col_name',
          minWidth: 200,
          isKeyboard: true,
          // eslint-disable-next-line react/prop-types
          Cell: ({ row: { index } }) => {
            return <FieldNameCell index={index} />
          },
        },
        {
          Header: (
            <HeaderTip
              title={i18next.t('字段属性设置')}
              tip={
                <div className='gm-padding-5' style={{ width: '470px' }}>
                  <div>
                    {i18next.t(
                      '用以设置字段参数的属性，可设置单选或文本属性，若设置单选属性，则在编辑商品工艺时，可选择已设置好的参数；若设置文本属性，则在编辑商品工艺时，可自主编辑参数，在此处无需维护参数。'
                    )}
                  </div>
                  <span className='gm-text-bold'>{i18next.t('示例：')}</span>
                  <div>
                    {i18next.t(
                      '01 对于像清洗时长等有固定时间维度的工艺，可选择单选属性，设置参数如3min，5min，7min等'
                    )}
                  </div>

                  <div>
                    {i18next.t(
                      '02 对于像炒制等菜品做法相关的工艺，因其与菜品密切相关，建议选择文本属性，在编辑商品工艺时，直接输入内容即可。'
                    )}
                  </div>
                </div>
              }
            />
          ),
          accessor: 'col_type',
          minWidth: 80,
          isKeyboard: true,
          Cell: (cellProps) => {
            const { index } = cellProps.row
            return <SelectCell index={index} />
          },
        },
        {
          Header: i18next.t('字段参数设置'),
          accessor: 'field_params',
          minWidth: 200,
          // eslint-disable-next-line react/prop-types
          Cell: ({ row: { index } }) => {
            return <FieldParamsCell index={index} />
          },
        },
      ]}
    />
  )
})

const TechnologyDetail = observer((props) => {
  const {
    name,
    custom_id,
    default_role,
    desc,
    technic_category_id,
  } = store.technologyDetail
  const { type } = props
  const isCreate = type === 'create'

  useEffect(() => {
    store.fetchRoleList()
    store.fetchTechnicCategoryList()
  }, [])

  const handleInputChange = (event) => {
    store.changeTechnologyDetailItem(event.target.name, event.target.value)
  }

  const handleSelectChange = (name, value) => {
    store.changeTechnologyDetailItem(name, value)
  }

  const handleCancel = () => {
    // 返回tab 且工艺处
    history.go(-1)
  }

  const handleSubmit = () => {
    const detail = store.getPostData()

    if (!detail.name.trim()) {
      Tip.warning(i18next.t('工艺名称不能为空'))
      return
    }

    if (!detail.custom_id.trim()) {
      Tip.warning(i18next.t('工艺编号不能为空'))
      return
    }

    // 新建
    if (isCreate) {
      store.postCreateTechnology().then(() => {
        Tip.success(i18next.t('添加成功'))
        history.go(-1)
      })
    } else {
      // 更新
      store.updateTechnology().then((json) => {
        // 二次确认是否修改
        if (json.code === 4) {
          Dialog.confirm({
            children: (
              <Flex column>
                <span>{json.msg}</span>
                <TipStyled className='gm-margin-top-10'>
                  {i18next.t(
                    '注：修改字段属性或删除工艺后，原商品所选工艺字段或工艺信息将会清空，请谨慎操作'
                  )}
                </TipStyled>
              </Flex>
            ),
            title: i18next.t('修改工艺'),
          }).then(() => {
            store.updateTechnology(1).then(() => {
              Tip.success(i18next.t('修改成功'))
              history.go(-1)
            })
          })
        } else {
          Tip.success(i18next.t('修改成功'))
          history.go(-1)
        }
      })
    }
  }

  const handleSecondEnsureDelete = (json) => {
    // 二次确认是否删除
    Dialog.confirm({
      children: json.msg,
      title: i18next.t('删除工艺'),
    }).then(() => {
      // 强制删除
      store.deleteTechnology(1).then(() => {
        Tip.success(i18next.t('删除成功'))
        history.go(-1)
      })
    })
  }

  const handleDelete = () => {
    Dialog.confirm({
      children: i18next.t('确认删除此工艺？'),
      title: i18next.t('删除工艺'),
    }).then(() => {
      store.deleteTechnology().then((json) => {
        if (json.code === 4) {
          handleSecondEnsureDelete(json)
        } else {
          Tip.success(i18next.t('删除成功'))
          history.go(-1)
        }
      })
    })
  }

  const handleTechnicCategory = () => {
    history.push(
      '/supply_chain/process/basic_info/technology_management/technic_category'
    )
  }

  return (
    <div>
      <FormPanel
        title={i18next.t('工艺信息')}
        right={
          isCreate ? null : (
            <Button onClick={handleDelete}>{i18next.t('删除')}</Button>
          )
        }
      >
        <Form
          className='gm-margin-15'
          labelWidth='200px'
          colWidth='470px'
          onSubmitValidated={handleSubmit}
        >
          <FormItem label={i18next.t('工艺名称')} required>
            <Input
              className='form-control'
              name='name'
              maxLength={8}
              value={name}
              onChange={handleInputChange}
            />
          </FormItem>
          <FormItem
            className='gm-margin-top-10'
            label={i18next.t('工艺编号')}
            required
          >
            <Input
              className='form-control'
              name='custom_id'
              maxLength={8}
              value={custom_id}
              onChange={handleInputChange}
            />
          </FormItem>
          <FormItem className='gm-margin-top-10' label={i18next.t('工艺类型')}>
            <Flex alignCenter>
              <Select
                value={technic_category_id || '0'}
                onChange={(value) =>
                  handleSelectChange('technic_category_id', value)
                }
                data={[{ value: '0', text: i18next.t('无') }].concat(
                  _.map(
                    store.technicCategoryList.slice(),
                    (technic_category) => ({
                      value: technic_category.id,
                      text: technic_category.name,
                    })
                  )
                )}
                style={{ minWidth: '260px' }}
              />
              <a
                className='gm-margin-left-10'
                style={{ width: '70px' }}
                onClick={handleTechnicCategory}
              >
                {i18next.t('管理类型')}
              </a>
            </Flex>
          </FormItem>
          <FormItem
            className='gm-margin-top-10'
            label={i18next.t('默认操作角色')}
          >
            <Select
              value={default_role || '0'}
              onChange={(value) => handleSelectChange('default_role', value)}
              data={[{ value: '0', text: i18next.t('未指定角色') }].concat(
                _.map(store.roleList.slice(), (role) => ({
                  value: role.id,
                  text: role.name,
                }))
              )}
            />
          </FormItem>
          <FormItem className='gm-margin-top-10' label={i18next.t('工艺描述')}>
            <textarea
              name='desc'
              value={desc}
              rows={4}
              maxLength={50}
              style={{ width: '300px' }}
              onChange={handleInputChange}
            />
          </FormItem>
          <FormItem
            className='gm-margin-top-10'
            colWidth='100%'
            label={i18next.t('自定义字段')}
          >
            <CustomTableCell />
          </FormItem>
          <FormButton>
            <Button className='gm-margin-right-5' onClick={handleCancel}>
              {i18next.t('取消')}
            </Button>
            <Button type='primary' htmlType='submit'>
              {i18next.t('保存')}
            </Button>
          </FormButton>
        </Form>
      </FormPanel>
    </div>
  )
})

export default TechnologyDetail
