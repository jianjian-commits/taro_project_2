import React from 'react'
import { i18next, t } from 'gm-i18n'
import { BatchPrinter, insertCSS, getCSS } from 'gm-printer'
import { LoadingFullScreen } from '@gmfe/react'
import { Flex, Button } from '@gmfe/react'
import html2canvas from 'html2canvas'
import formatData from '../../../printer/salemenus_printer/config/data_to_key'
import { Request } from '@gm-common/request'

class SalemenuToImage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
    }
    this.refImage = React.createRef()

    insertCSS(insertCSS() + getCSS())
  }

  getConfig = (id) => {
    return Request('/fe/sale_menu_tpl/get')
      .data({ id })
      .get()
      .then(
        (res) => res.data.content,
        () => {
          window.alert(i18next.t('模板接口发生错误，请重试！'))
        },
      )
  }

  getDataList = (req) => {
    return Request('/station/salemenu/print')
      .data(req)
      .get()
      .then((res) => res.data)
  }

  async componentDidMount() {
    const { template_id, salemenu_id, print_type } = this.props.location.query

    LoadingFullScreen.render({
      size: 100,
      text: i18next.t('正在加载数据，请耐心等待!'),
    })

    const [data, config] = await Promise.all([
      this.getDataList({ salemenu_id, print_type }),
      this.getConfig(template_id),
    ])

    const list = [
      {
        config,
        data: formatData(data),
      },
    ]

    this.setState({ list })

    LoadingFullScreen.hide()
  }

  handleCreateImage = () => {
    LoadingFullScreen.render({
      size: 100,
      text: t('正在生成图片，请耐心等待!'),
    })
    html2canvas(this.refImage.current, {
      // //   scale: 3,
      useCORS: true,
    }).then((canvas) => {
      const base64Url = canvas.toDataURL()
      // 生成图片
      const a = document.createElement('a')
      a.download = '商品报价'
      a.href = base64Url
      // 就是生成失败html2canvas返回了一个data:; 长度为6的字符串 提示一下
      if (base64Url.length === 6) {
        window.alert('商品数量过多，图片生成失败')
      } else {
        a.click()
      }
      LoadingFullScreen.hide()
    })
  }

  render() {
    return (
      <Flex justifyCenter>
        <div ref={this.refImage}>
          <BatchPrinter list={this.state.list} />
        </div>
        <Button className='gm-margin-top-20' onClick={this.handleCreateImage}>
          生成图片
        </Button>
      </Flex>
    )
  }
}

export default SalemenuToImage
