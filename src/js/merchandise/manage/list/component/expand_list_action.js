/**
 * @description 商品库-列表顶部操作按钮
 * @path 商品-商品管理-商品库
 */
import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  Dialog,
  Flex,
  FunctionSet,
  RightSideModal,
  Tip,
} from '@gmfe/react'
import store from '../list_store'
import manageStore from '../../store'
import _ from 'lodash'
import globalStore from '../../../../stores/global'
import { history, System } from '../../../../common/service'
import { saleReferencePrice } from '../../../../common/enum'
import ImportModal from './import_modal'
import { requireGmXlsx } from 'gm-service/src/require_module/require_gm_xlsx'
import { Request } from '@gm-common/request'
import TaskList from '../../../../task/task_list'
import { spuImportHeader, spuCleanFoodImportHeader } from '../util'
import { renderMatchImageModal } from '../match_images/modal'
import PropType from 'prop-types'

@observer
class ExpandListAction extends React.Component {
  constructor(props) {
    super(props)
    this.refImportInput = React.createRef()
  }

  handleCreate = () => {
    history.push(System.getUrl('/merchandise/manage/list/sku_detail'))
  }

  handleChangeRefPrice = (type) => {
    manageStore.setRefPriceType(1, type)
  }

  handleImportBatchUpdate = () => {
    this.refImportInput && this.refImportInput.current.click()
  }

  handleMatchImage = () => {
    renderMatchImageModal()
  }

  renderTaskList = () => {
    RightSideModal.render({
      children: <TaskList tabKey={1} />,
      noCloseBtn: true,
      onHide: RightSideModal.hide,
      opacityMask: true,
      style: {
        width: '300px',
      },
    })
  }

  handleImportBatchCreate = (typeName) => {
    Dialog.confirm({
      title: i18next.t('批量新建商品'),
      children: <ImportModal typeName={typeName} retail={this.props.retail} />,
      size: 'md',
      onOK: () => {
        const { salemenus, pic, excel, checked } = store
        const isCleanFoodType = typeName === 'cleanFood'

        if (!excel) {
          Tip.warning(i18next.t('请选择上传文件'))
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject()
        }
        if ((pic?.size || 0) + excel.size > 50 * 1024 * 1024) {
          Tip.warning(i18next.t('excel和图片压缩包的大小加起来必须小于50M'))
          return
        }
        // 净菜商品不校验报价单
        if (!isCleanFoodType && checked && !salemenus.length) {
          Tip.warning(i18next.t('请选择报价单'))
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject()
        }
        return this.handleImportModalOk(
          {
            salemenus: JSON.stringify(salemenus.slice().map((i) => i.value)),
            pic,
            excel,
            is_clean_food: isCleanFoodType ? 1 : 0,
          },
          isCleanFoodType,
        ).then(() => {
          setTimeout(() => {
            this.renderTaskList()
          })
        })
      },
    })
  }

  handleImportModalOk = (value, isCleanFoodType) => {
    const { excel } = value
    const reqData = isCleanFoodType ? _.omit(value, ['salemenus']) : value

    return new Promise((resolve, reject) => {
      requireGmXlsx((result) => {
        const { sheetToJson } = result
        sheetToJson(excel).then(async ([file]) => {
          const [content] = Object.values(file)
          if (!content.length) {
            Tip.warning(i18next.t('请导入正确格式的excel'))
            // eslint-disable-next-line prefer-promise-reject-errors
            return reject()
          }
          let [title] = content
          const columnCounnt = isCleanFoodType ? 12 : 7
          // 因为长度不够的时候不遍历，所以需要加上长度，校验才合理
          if (title.length < columnCounnt) {
            const fill = new Array(columnCounnt - title.length)
            title = [...title, ...fill]
          }
          let stop = false
          title = isCleanFoodType
            ? title.slice(0, columnCounnt)
            : title.slice(0, columnCounnt)

          _.forEach(title, (item, index) => {
            const enumeration = isCleanFoodType
              ? spuCleanFoodImportHeader
              : spuImportHeader
            const target = enumeration[index]
            const error = this.checkExcelTitleFormat(item, target, index)
            if (error) {
              Tip.warning(error)
              stop = true
            }
          })
          if (stop) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return reject()
          }
          try {
            await Request('/task/list')
              .get()
              .then(({ data }) => {
                const { finish, tasks } = data
                if (!finish && tasks.some((i) => i.type === 15)) {
                  // eslint-disable-next-line prefer-promise-reject-errors
                  reject()
                  throw new Error(i18next.t('已有同类任务在进行，请勿重复上传'))
                }
              })
            Request('/merchandise/batch_create/import', {
              timeout: 1200000,
            })
              .data(reqData)
              .post()
              .then(() => {
                resolve()
              })
          } catch (error) {
            Tip.warning(i18next.t('已有同类任务在进行，请勿重复上传'))
            // eslint-disable-next-line prefer-promise-reject-errors
            return reject()
          }
        })
      })
    })
  }

  checkExcelTitleFormat(title, target, index) {
    let string
    if (title !== target) {
      string = `${i18next.t('表头第')}${index + 1}${i18next.t(
        '个应该为',
      )}${target}`
    }
    return string
  }

  handleUploadExcel = (e) => {
    const file = e.target.files[0]
    this.refImportInput.current.value = ''

    Dialog.dialog({
      title: i18next.t('提示'),
      children: (
        <div>
          <div>{i18next.t('是否确定上传') + file.name}</div>
        </div>
      ),
      onOK: () => {
        store.batchUpload(file).then(() => {
          setTimeout(() => {
            this.renderTaskList()
          })
        })
      },
    })
  }

  handleBatchCreate = () => {
    history.push({
      pathname: '/c_retail/basic_info/list/batch_categories',
      search: `?salemenuId=${globalStore.c_salemenu_id}`,
    })
  }

  render() {
    const p_importSpuByTemplate = globalStore.hasPermission(
      'import_spu_by_template',
    )
    const p_importBatchUpdate = globalStore.hasPermission(
      'edit_product_sku_batch_import',
    )
    const p_batchCreateSpu = globalStore.hasPermission('batch_create_spu')
    const p_smartMenu = globalStore.hasPermission('get_smart_menu')

    return (
      <Flex>
        <input
          accept='.xlsx'
          type='file'
          ref={this.refImportInput}
          onChange={this.handleUploadExcel}
          style={{ display: 'none' }}
        />
        <Button
          type='primary'
          className='gm-margin-right-5'
          onClick={this.handleCreate}
        >
          {i18next.t('新建销售商品')}
        </Button>
        <FunctionSet
          ref={store.refMoreAction}
          data={[
            {
              text: i18next.t('智能菜单'),
              onClick: () =>
                history.push('/merchandise/manage/list/smart_menu'),
              show: System.isB() && p_smartMenu,
            },
            // 需要调整
            {
              text: i18next.t('分类管理'),
              onClick: () =>
                window.open(
                  System.getUrl('#/merchandise/manage/category_management'),
                ),
            },
            {
              text: i18next.t('周期定价'),
              onClick: () =>
                window.open(
                  System.getUrl('#/merchandise/manage/sale/cycle_pricing'),
                ),
            },
            {
              text: i18next.t('云商品导入'),
              onClick: () =>
                window.open(
                  System.getUrl('#/merchandise/manage/list/cloud_goods'),
                ),
              show: p_importSpuByTemplate,
            },
            {
              text: (
                <div data-id='initBatchImportGoods'>
                  {globalStore.isCleanFood()
                    ? i18next.t('批量新建毛菜商品(导入)')
                    : i18next.t('批量新建商品(导入)')}
                </div>
              ),
              onClick: () => this.handleImportBatchCreate('notCleanFood'),
              show: p_batchCreateSpu,
            },
            globalStore.isCleanFood() && {
              text: i18next.t('批量新建净菜商品(导入)'),
              onClick: () => this.handleImportBatchCreate('cleanFood'),
              show: p_batchCreateSpu,
            },
            {
              text: i18next.t('批量修改销售商品(导入)'),
              onClick: this.handleImportBatchUpdate,
              show: p_importBatchUpdate,
            },
            {
              text: i18next.t('批量新建商品'),
              onClick: this.handleBatchCreate,
              show: System.isC(),
            },
            {
              text: i18next.t('参考成本来源'),
              children: _.map(saleReferencePrice, (item) => {
                return {
                  text: item.name,
                  onClick: this.handleChangeRefPrice.bind(this, item.type),
                }
              }),
            },
            {
              text: (
                <div data-id='initMatchImages'>
                  {i18next.t('快速匹配商品图片')}
                </div>
              ),
              onClick: this.handleMatchImage,
            },
          ].filter((v) => v)}
          right
        />
      </Flex>
    )
  }
}

ExpandListAction.propTypes = {
  retail: PropType.bool,
}

export default ExpandListAction
