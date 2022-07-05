import React, { Component } from 'react'
import { t, i18next } from 'gm-i18n'
import {
  Button,
  Dialog,
  Flex,
  Form,
  FormButton,
  FormItem,
  Input,
  Modal,
  Popover,
  Box,
  BoxTable,
  Select,
  Tip,
  RightSideModal,
} from '@gmfe/react'
import { Request } from '@gm-common/request'
import { TreeList } from 'common/components/tree_list'
import PopConfirm from './pop_confirm'
import AddCategory1 from 'common/components/tree_list/add_category1'
import { withRouter } from 'react-router'
import IconsManagement from './icons_management'
import globalStore from 'stores/global'
import Edit from './edit'
import { SvgEditOrder } from 'gm-svg'
import { service, selectedList } from './service'
import ItemActions from './item_actions'
import TaskList from '../../../task/task_list'
import {
  clearChecked,
  filterCheckList,
} from 'common/components/tree_list_v2/utils'
import { TableXUtil } from '@gmfe/table-x'
import qs from 'query-string'
import { System } from 'common/service'
import { BATCH_DELETE_TYPE, BATCH_DELETE_URL } from './enum'

@withRouter
class CategoryManagement extends Component {
  refImportInput = React.createRef(null)
  icons = []

  /** 树的ref，用于定位 */
  treeListRef

  state = {
    /** 商品库类型 */
    selected: 2,
    /** 搜索用，分类树数据源 */
    treeDataSource: [],
    /** 分类树 */
    list: [],
    /** 勾选的id */
    checkList: [],
    /** 新建子分类中的input的值 */
    name: '',
    /** 实际勾选的spulist */
    checkData: [],
    /** 定位输入框的值 */
    location: '',
    /** 勾选的id （包括子元素） */
    completeCheckedList: [],
  }

  /** 辅助变量 */
  addCategory1Name = ''
  /** 辅助变量 */
  addCategory1Icon = undefined
  /** 辅助变量 */
  addCategory1ScopeType = 0

  componentDidMount() {
    this.getListData()
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  /**
   * 同时获取一级分类、二级分类、品类，并从新组装
   */
  getListData() {
    return Promise.all([
      service.getCategory1(),
      service.getCategory2(),
      service.getPinLei(),
      service.getIcons(),
    ]).then(
      ([
        { data: category1 },
        { data: category2 },
        { data: pinLei },
        { data: icons },
      ]) => {
        this.icons = icons
        category1.sort((pre, cur) => cur.rank - pre.rank)
        category2.sort((pre, cur) => cur.rank - pre.rank)
        pinLei.sort((pre, cur) => cur.rank - pre.rank)
        category1 = service.rebuildTreeNode(category1, 0, icons)
        category2 = service.rebuildTreeNode(category2, 1)
        pinLei = service.rebuildTreeNode(pinLei, 2)
        this.addActions(category1)
        this.addActions(category2)
        this.addActions(pinLei)
        category2 = service.rebuildTree(category2, pinLei)
        const list = service.rebuildTree(category1, category2)
        this.setState({ list, treeDataSource: list })
      },
    )
  }

  /**
   * 添加树右侧行为按钮
   * @param list {object[]}
   */
  addActions = (list) => {
    list.forEach((item) => {
      item.edit = (
        <Edit
          value={item}
          icons={this.icons}
          onOk={this.handleEdit}
          onHighlight={() => this.setState(({ list }) => ({ list: [...list] }))}
        />
      )
      item.actions = (
        <ItemActions
          value={item}
          onAddSubclass={this.handleAddSubclass}
          onChangeName={this.handleChangeName}
          onCreateSpu={this.handleCreateSpu}
          onHighlight={() => this.setState(({ list }) => ({ ...list }))}
          renderDelete={this.renderDelete}
        />
      )
    })
  }

  /**
   * 创建商品
   * @param value {object}
   */
  handleCreateSpu = (value) => {
    const { parent, id } = value
    const { list } = this.state
    const two = service.findParent(parent, list)
    const one = service.findParent(two.parent, list)
    const isStation = one.station_id ? 1 : 0
    window.open(
      System.getUrl(
        `#/merchandise/manage/list/sku_detail?one=${one.id}&two=${two.id}&pinLei=${id}&realCreate=true&isStation=${isStation}`,
      ),
    )
  }

  /**
   * 创建子分类
   * @param value {object}
   * @returns {Promise<*>}
   */
  handleAddSubclass = (value) => {
    const { level, id } = value
    const { name } = this.state
    if (!name) {
      Tip.danger(t('请输入分类名称'))
      return
    }
    if (name.trim().length > 20) {
      Tip.warning(t('分类名称不得大于20'))
      return
    }
    const url = {
      0: '/merchandise/category2/create',
      1: '/merchandise/pinlei/create',
    }[level]
    const option = {
      name,
      upstream_id: id,
      is_retail_interface: System.isC() ? 1 : null,
    }
    return Request(url)
      .data(option)
      .post()
      .then(async ({ data }) => {
        Tip.success(t('新增成功！'))
        await this.getListData()
        const { list } = this.state
        service.resetTreeList(list)
        service.expandToId(data, list)
        this.setState({ ...list })
      })
  }

  /**
   * 新增子分类里面Input的值修改
   * @param name {string}
   */
  handleChangeName = (name) => {
    this.setState({ name })
  }

  /**
   * 删除当前分类
   * @param value {object}
   * @returns {Promise<*>}
   */
  handleDelete = (value) => {
    const { level, id, parent } = value
    const { list } = this.state
    const option = { id }
    if (System.isC()) option.is_retail_interface = 1

    const url = {
      0: '/merchandise/category1/delete',
      1: '/merchandise/category2/delete',
      2: '/merchandise/pinlei/delete',
      3: '/merchandise/spu/delete',
    }[level]

    return Request(url)
      .data(option)
      .post()
      .then(async () => {
        Tip.success(t('删除成功！'))
        if (level === 3) {
          const brothers = service.findParent(parent, list).children
          const index = brothers.findIndex((item) => item.id === id)
          brothers.splice(index, 1)
          this.setState(({ list }) => list)
        } else {
          await this.getListData()
          const { list } = this.state
          const node = service.findParent(parent, list)
          service.resetTreeList(list)
          service.expandToId(parent, list)
          if (node.children && node.children.length) {
            node.expand = true
          }
          this.setState({ ...list })
        }
      })
  }

  /**
   * @description 清除已选择的所有数据
   */
  clearCheckData = () => {
    const { list } = this.state
    clearChecked(list)
    this.setState({ checkData: [], checkList: [], list })
  }

  /**
   * @description 批量删除不同的分类弹框及筛选已勾选idList
   * @param {string} type 分类类型
   */
  handleBatchDelete = (type) => {
    if (type) {
      const content = BATCH_DELETE_TYPE[type].spanContent
      const filterType = BATCH_DELETE_TYPE[type].filterType
      const { completeCheckedList } = this.state
      const [checkedNum, filterCheckedList] = filterCheckList(
        completeCheckedList,
        filterType,
      )
      Dialog.confirm({
        title: t(`批量删除${content}`),
        children: (
          <Flex column>
            <span>
              {i18next.t(
                `已选择${checkedNum}个${content}，确定要删除所选${content}吗？`,
              )}
            </span>
            <span className='gm-text-red'>
              {type !== 'category' &&
                i18next.t(
                  `1.删除所选${content}时将同时删除所选${content}下的${
                    type === 'first' ? '所有二级分类和品类' : '所有品类'
                  }；`,
                )}
            </span>
            <span className='gm-text-red'>
              {i18next.t(
                `${
                  type === 'category' ? 1 : 2
                }.分类下无商品数据时可进行删除，删除后相关数据将无法恢复，请谨慎操作；`,
              )}
            </span>
            <span className='gm-text-red'>
              {i18next.t(
                `${
                  type === 'category' ? 2 : 3
                }.分类可能存在总分仓共享，删除分类会影响其他总分仓站点的分类；`,
              )}
            </span>
          </Flex>
        ),
      }).then(() => {
        this.handleBatchDeleteRequest(filterCheckedList, type)
      })
    }
  }

  handleBatchDeleteRequest = (idList, type) => {
    const url = BATCH_DELETE_URL[type]
    const params = {
      id_list: JSON.stringify(idList),
    }
    Request(url)
      .data(params)
      .post()
      .then(() => {
        Tip.success(t('已发送批量删除请求,请到异步任务中查看'))
        Request('/task/list')
          .get()
          .then((json) => {
            const finish = json.data.finish
            if (!finish) {
              this.timer = setInterval(() => {
                Request('/task/list')
                  .get()
                  .then((res) => {
                    if (res.data.finish) {
                      clearTimeout(this.timer)
                      this.getListData()
                      const { list } = this.state
                      service.resetTreeList(list)
                      this.setState({ list, checkList: [] })
                    }
                  })
              }, 1500)
            }
          })
      })
  }

  /**
   * 点击搜索按钮
   */
  handleSearch = () => {
    const { selected, treeDataSource } = this.state
    const list = treeDataSource.filter((f) => {
      // selected: 2 全部商品库 1 本站商品库 0 通用商品库
      // station_id 存在时为本站商品库
      if (selected === 2) return true
      if (selected === 1) return f.station_id
      return !f.station_id
    })
    this.setState({ list })
  }

  /**
   * 导出
   * @param event
   */
  handleExport = (event) => {
    event.preventDefault()
    const { selected } = this.state
    window.open(
      '/merchandise/spu/export?' +
        qs.stringify({
          p_type: selected !== 2 ? selected : '',
          salemenu_id: System.isC() ? globalStore.c_salemenu_id : '',
          is_retail_interface: System.isC() ? 1 : null,
        }),
    )
  }

  /**
   * 勾选
   * @param checkList {string[]}
   */
  handleCheck = ({ checkList, completeCheckedList }) => {
    const requests = []
    this.setState({ checkList, completeCheckedList })
    const moveCategory = globalStore.hasPermission('move_category')
    if (!moveCategory) {
      return
    }
    checkList
      .filter((item) => item[0] !== 'C')
      .forEach((item) => {
        const url = '/merchandise/spu/list'
        const option = {}
        switch (item[0]) {
          case 'A':
            option.category_id_1 = item
            break
          case 'B':
            option.category_id_2 = item
            break
          case 'P':
            option.pinlei_id = item
            break
        }
        if (System.isC()) option.is_retail_interface = 1
        requests.push(Request(url).data(option).get())
      })
    let checkData = []
    Promise.all(requests).then((value) => {
      const { list } = this.state
      const spuCheckList = checkList.filter((item) => item[0] === 'C')
      const spuCheckData = []
      service.getObjectById(spuCheckList, list, spuCheckData)
      value.forEach(({ data }) => {
        checkData = [...checkData, ...data]
      })
      checkData = [...checkData, ...spuCheckData]
      this.setState({ checkData })
    })
  }

  /**
   * 渲染删除浮层
   * @param value {object}
   * @returns {*}
   */
  renderDelete = (value) => {
    const { name } = value
    const isSpu = value.level === 3
    return (
      <PopConfirm
        value={value}
        title={!isSpu ? t('删除分类') : t('删除商品规格')}
        content={
          <>
            {!isSpu
              ? t('分类下无商品数据时可删除分类，是否确定删除分类')
              : t('是否确定删除商品规格')}
            <span
              className='gm-padding-left-5 gm-text-14'
              style={{ fontWeight: 'bold' }}
            >
              {name}
            </span>
            ？
          </>
        }
        onOkText={t('删除')}
        onOkType='danger'
        onOk={() => this.handleDelete(value)}
        onHighlight={() => this.setState(({ list }) => ({ list: [...list] }))}
      />
    )
  }

  /**
   * 展开子元素，包括获取商品
   * @param expand {boolean}
   * @param value {object}
   */
  handleExpand = ({ expand, value }) => {
    const { level, id, checked } = value
    if (level !== 2) {
      return
    }
    if (expand) {
      value.loading = true
      Request('/merchandise/spu/list')
        .data({ pinlei_id: id, is_retail_interface: System.isC() ? 1 : null })
        .get()
        .then(({ data }) => {
          const { selected } = this.state
          value.loading = false
          value.showSort = selected === 2
          data.sort((pre, cur) => cur.rank - pre.rank)
          data = data.map((item) => ({
            id: item.id,
            value: item.id,
            title: item.name,
            name: item.name,
            parent: id,
            type: item.p_type,
            level: 3,
            children: [],
            checked,
          }))
          data.forEach((item) => {
            const path = System.getUrl('/merchandise/manage/list/sku_detail')
            item.edit = (
              <span onClick={() => window.open(`#${path}?spu_id=${item.id}`)}>
                <TableXUtil.OperationIconTip tip={t('编辑')}>
                  <span>
                    <SvgEditOrder className='station-tree-icon station-tree-edit gm-text-hover-primary' />
                  </span>
                </TableXUtil.OperationIconTip>
              </span>
            )
            item.actions = (
              <Popover
                popup={this.renderDelete(item)}
                right
                ref={(ref) => (item.deleteRef = ref)}
                offset={-10}
              >
                <Button type='link'>{t('删除')}</Button>
              </Popover>
            )
          })
          value.allChildren = data
          if (selected === 2) {
            value.children = value.allChildren
          } else {
            value.children = value.allChildren.filter(
              (item) => item.type === selected,
            )
          }
          this.setState(({ list }) => list)
        })
    } else {
      value.children = []
      this.setState(({ list }) => list)
    }
  }

  /**
   * 编辑当前分类
   * @param value {object}
   * @param name {string}
   * @param icon
   * @returns {Promise<*>}
   */
  handleEdit = (value, name, icon) => {
    if (name.trim().length > 20) {
      Tip.warning(t('分类名长度不得大于20'))
      return
    }
    const { id, level } = value
    const url = {
      0: '/merchandise/category1/update',
      1: '/merchandise/category2/update',
      2: '/merchandise/pinlei/update',
      3: '/merchandise/spu/update',
    }[level]
    const option = { id, name }
    if (icon) {
      option.icon = icon
    }
    if (System.isC()) option.is_retail_interface = 1
    return Request(url)
      .data(option)
      .post()
      .then(async () => {
        if (level === 3) {
          value.name = value.title = name
          this.setState(({ list }) => list)
        } else {
          if (level === 2) {
            value.name = value.title = name
            this.handleExpand({ expand: true, value })
          } else {
            await this.getListData()
            const { list } = this.state
            service.resetTreeList(list)
            service.expandToId(id, list)
            this.setState({ ...list })
          }
        }
      })
  }

  /**
   * 添加一级分类
   */
  handleAddCategory1 = () => {
    Dialog.confirm({
      title: t('新建分类'),
      size: 'md',
      children: (
        <AddCategory1
          icons={this.icons}
          onTextChange={(name) => (this.addCategory1Name = name)}
          onIconSelected={(icon) => (this.addCategory1Icon = icon)}
          onScopeSelected={(scopeType) =>
            (this.addCategory1ScopeType = scopeType)
          }
        />
      ),
      OKBtn: t('保存'),
      onCancel: () => {},
      onOK: () => {
        if (this.addCategory1Name.trim().length > 20) {
          Tip.warning(t('分类名的长度不得大于20 '))
          return
        }
        return Request('/merchandise/category1/create')
          .data({
            name: this.addCategory1Name,
            icon: this.addCategory1Icon,
            scope_type: this.addCategory1ScopeType,
            is_retail_interface: System.isC() ? 1 : null,
          })
          .post()
          .then(() => {
            Tip.success(t('添加成功！'))
            const { list } = this.state
            this.getListData()
            service.resetTreeList(list)
            this.setState({ list, checkList: [], completeCheckedList: [] })
          })
      },
    })
  }

  /**
   * 打开图标管理模态框
   */
  handleIconsManagement = () => {
    Modal.render({
      title: t('一级分类图标管理'),
      children: <IconsManagement onOk={() => this.getListData()} />,
      onHide: Modal.hide,
    })
  }

  /**
   * 转移分类
   * @param value  {{category_id_1:string, category_id_2:string, pinlei_id :string}}
   */
  handleMove = (value) => {
    const { checkList } = this.state
    const category_ids_1 = []
    const category_ids_2 = []
    const pinlei_ids = []
    const spu_ids = []
    checkList.forEach((i) => {
      switch (i[0]) {
        case 'A':
          category_ids_1.push(i)
          break
        case 'B':
          category_ids_2.push(i)
          break
        case 'P':
          pinlei_ids.push(i)
          break
        case 'C':
          spu_ids.push(i)
          break
      }
    })
    const option = {
      ...value,
    }
    const object = {
      category_ids_1,
      category_ids_2,
      pinlei_ids,
      spu_ids,
    }
    for (const [key, value] of Object.entries(object)) {
      if (value.length) {
        option[key] = JSON.stringify(value)
      }
    }
    Request('/merchandise/spu/update_category')
      .data(option)
      .post()
      .then(async ({ data }) => {
        const { fail_spus } = data
        if (fail_spus.length) {
          Tip.danger(t('转移失败') + fail_spus.length + t('条'))
        } else {
          Tip.success(t('转移分类成功'))
        }
        await this.getListData()
        this.setState({ checkList: [], checkData: [] })
        Modal.hide()
      })
  }

  /**
   * 通过分类名称查找对应分类的位置
   */
  handleFindLocation = () => {
    const { location, list } = this.state
    if (!location) {
      Tip.warning(t('请输入分类名'))
      return
    }
    this.node = null
    service.resetTreeList(list)
    const flag = this.findTreeNode(location, list)
    if (!flag) {
      Tip.warning(t('没有找到该分类'))
      return
    }
    this.setState({ list })
    setTimeout(() => {
      // 不确定放在这里好还是放在生命周期里面更好
      this.treeListRef.scrollTop = this.node.ref.offsetTop - 10
    })
  }

  /**
   * 查找分类名称对应的树节点
   * @param name {string}
   * @param list {object[]}
   * @returns {boolean}
   */
  findTreeNode(name, list) {
    let flag = false
    if (list.some((item) => item.name === name)) {
      const beFound = list.find((item) => item.name === name)
      beFound.highlight = true
      flag = true
      if (!this.node) {
        this.node = beFound
      }
    } else {
      list.forEach((item) => {
        item.expand = this.findTreeNode(name, item.children)
        flag = flag || item.expand
      })
    }
    return flag
  }

  /**
   * 拖动排序
   * @param data {object[]} 当前被拖动的数组
   * @param parent {object}
   */
  handleSort = (data, parent) => {
    const value = data.map((item, index) => ({
      id: item.id,
      rank: data.length - index,
    }))
    const option = {}
    const [{ level }] = data
    let url = ''
    switch (level) {
      case 0:
        url = '/merchandise/category1/batch_update'
        option.category1_list = JSON.stringify(value)
        break
      case 1:
        url = '/merchandise/category2/batch_update'
        parent.children = data
        option.category2_list = JSON.stringify(value)
        break
      case 2:
        url = '/merchandise/pinlei/batch_update'
        parent.children = data
        option.pinlei_list = JSON.stringify(value)
        break
      case 3:
        url = '/merchandise/spu/update_rank'
        parent.children = data
        option.spu_list = JSON.stringify(value)
        option.pinlei_id = parent.id
        break
    }
    Request(url)
      .data(option)
      .post()
      .then(() => {
        this.setState(({ list }) => ({
          list: level ? list : data,
        }))
      })
  }

  handleClearHighlight = (value) => {
    value.highlight = false
    const { list } = this.state
    this.setState({ ...list })
  }

  handleImport = () => {
    this.refImportInput && this.refImportInput.current.click()
  }

  handleUploadExcel = (e) => {
    const file = e.target.files[0]
    const extensionName = e.target.files[0].name.split('.')[1]
    if (extensionName !== 'xlsx' && extensionName !== 'xls') {
      return Tip.warning(t('请导入正确格式的excel'))
    }
    return Request('/merchandise/spu/batch_update')
      .data({ excel: file, is_retail_interface: System.isC() ? 1 : null })
      .post()
      .then(() => {
        RightSideModal.render({
          children: <TaskList tabKey={1} />,
          onHide: RightSideModal.hide,
          style: {
            width: '300px',
          },
        })
      })
  }

  render() {
    const { selected, list, checkList, checkData, location } = this.state
    const editMerchandiseOrder = globalStore.hasPermission(
      'edit_merchandise_order',
    )
    const editSpuBatch = globalStore.hasPermission('edit_spu_batch')
    const editCategory = globalStore.hasPermission('edit_category')
    return (
      <>
        <Box hasGap>
          <Form inline onSubmit={this.handleSearch}>
            <FormItem label={t('商品库')}>
              <Select
                data={selectedList}
                value={selected}
                onChange={(value) => this.setState({ selected: value })}
              />
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
        <BoxTable
          action={
            <Flex alignCenter row>
              <input
                accept='.xlsx'
                type='file'
                ref={this.refImportInput}
                onChange={this.handleUploadExcel}
                style={{ display: 'none' }}
              />
              <Input
                value={location}
                className='form-control'
                style={{ width: '220px' }}
                placeholder={t('请输入分类名')}
                onChange={({ target: { value } }) =>
                  this.setState({ location: value })
                }
              />
              <Button type='primary' onClick={this.handleFindLocation}>
                {t('定位')}
              </Button>
              <div className='gm-margin-lr-20'>|</div>
              {editCategory && (
                <Button
                  type='primary'
                  className='gm-margin-right-10'
                  onClick={this.handleAddCategory1}
                >
                  {t('新建一级分类')}
                </Button>
              )}
              {editSpuBatch && (
                <Button
                  type='primary'
                  className='gm-margin-right-10'
                  onClick={this.handleImport}
                >
                  {t('批量导入')}
                </Button>
              )}
              {editMerchandiseOrder && (
                <Button onClick={this.handleIconsManagement}>
                  {t('图标管理')}
                </Button>
              )}
            </Flex>
          }
        >
          <TreeList
            treeData={list}
            checkList={checkList}
            checkData={checkData}
            clearCheckData={this.clearCheckData}
            onHandleBatchDelete={this.handleBatchDelete}
            ref={(ref) => (this.treeListRef = ref)}
            style={{
              maxHeight: 'calc(100vh - 180px)',
              overflowY: 'auto',
            }}
            onCheck={this.handleCheck}
            onExpand={this.handleExpand}
            onMove={this.handleMove}
            onSort={this.handleSort}
            onClearHighlight={this.handleClearHighlight}
          />
        </BoxTable>
      </>
    )
  }
}

export default CategoryManagement
