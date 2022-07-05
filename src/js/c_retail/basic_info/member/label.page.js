import React from 'react'
import { t } from 'gm-i18n'
import {
  FormItem,
  FormButton,
  Flex,
  Form,
  Button,
  Input,
  Tip
} from '@gmfe/react'
import _ from 'lodash'
import { SvgPlus } from 'gm-svg'
import { Table, TableUtil } from '@gmfe/table'
import { ManagePaginationV2 } from '@gmfe/business'
import { observer } from 'mobx-react'
import { QuickPanel, QuickFilter } from '@gmfe/react-deprecated'

import store from './store'

const { OperationDelete, OperationCell, OperationHeader } = TableUtil

@observer
class LabelManage extends React.Component {
  constructor(props) {
    super(props)
    this.refPagination = React.createRef(null)
  }

  componentDidMount() {
    store.setDoLabelFirstRequest(this.refPagination.current.apiDoFirstRequest)
    this.refPagination.current.apiDoFirstRequest()
  }

  handleTextChange = e => {
    const { value, name } = e.target
    store.setLabelFilter(name, value)
  }

  handleSearch = () => {
    store.doLabelFirstRequest()
  }

  handleDelete = id => {
    store.deleteUserLabel(id).then(() => {
      Tip.success(t('删除成功'))
      store.doLabelFirstRequest()
    })
  }

  handlePageChange = page => {
    return store.getUserLabelList(page)
  }

  handleAdd = () => {
    const can_add = _.every(store.user_label_list.slice(), i => !i.edit)
    if (can_add) {
      store.addUserLabelListItem(0)
    } else {
      Tip.warning(t('请填写标签名称，并点击保存'))
    }
  }

  handleCreate = index => {
    const name = store.user_label_list[index].name
    if (name) {
      store
        .addUserLabel(name)
        .then(() => {
          Tip.success(t('添加成功'))
          store.changeUserLabelListItem(index, { name: name, edit: false })
          store.doLabelFirstRequest()
        })
        .catch(() => {
          Tip.warning(t('添加失败'))
        })
    } else {
      Tip.warning(t('请填写标签名称'))
    }
  }

  hanleCanel = index => {
    store.deleteUserLabelListItem(index)
  }

  handleChangeItem = (index, data) => {
    store.changeUserLabelListItem(index, { name: data, edit: true })
  }

  render() {
    const { search_text } = store.label_filter

    return (
      <div>
        <QuickFilter>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem>
              <input
                type='text'
                value={search_text}
                name='search_text'
                className='form-control'
                placeholder={t('搜索客户标签名称')}
                onChange={this.handleTextChange}
              />
            </FormItem>
            <FormButton>
              <Button htmlType='submit' type='primary'>
                {t('搜索')}
              </Button>
            </FormButton>
          </Form>
        </QuickFilter>
        <QuickPanel
          title={t('客户标签列表')}
          right={
            <Button
              onClick={this.handleAdd}
              className='gm-btn-plain'
              type='primary'
            >
              {t('新建标签')}
              <SvgPlus />
            </Button>
          }
        >
          <ManagePaginationV2
            id='pagination_member_card_use_info_label_list'
            onRequest={this.handlePageChange}
            ref={this.refPagination}
          >
            <Table
              data={store.user_label_list.slice()}
              columns={[
                {
                  Header: t('标签名称'),
                  accessor: 'name',
                  Cell: ({ original, index }) => {
                    const { edit, name } = original
                    return edit ? (
                      <Input
                        value={name}
                        maxLength={30}
                        onChange={e => {
                          this.handleChangeItem(index, e.target.value)
                        }}
                      />
                    ) : (
                      <span>{name}</span>
                    )
                  }
                },
                {
                  Header: OperationHeader,
                  accessor: 'edit',
                  Cell: ({ index, original }) => {
                    const { id, edit } = original
                    return (
                      <OperationCell>
                        {edit ? (
                          <Flex justifyCenter>
                            <Button
                              type='link'
                              onClick={this.handleCreate.bind(this, index)}
                            >
                              {t('保存')}
                            </Button>
                            <Button
                              type='link'
                              onClick={this.hanleCanel.bind(this, index)}
                            >
                              {t('取消')}
                            </Button>
                          </Flex>
                        ) : (
                          <OperationDelete
                            title={t('确认删除')}
                            onClick={() => this.handleDelete(id)}
                          />
                        )}
                      </OperationCell>
                    )
                  }
                }
              ]}
            />
          </ManagePaginationV2>
        </QuickPanel>
      </div>
    )
  }
}

export default LabelManage
