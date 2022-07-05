// 处理分拣进度普通和投屏的ui样式
class UiStyle {
  colorIndex = 0
  colorList = []
  completedColor = 'rgb(134, 176, 78)'
  unfinishedColor = 'rgb(136, 164, 187)'
  stockOutColor = '#FA1C2C'

  setColor(list) {
    this.colorIndex = 0
    this.colorList = list
  }

  getColor() {
    return this.colorList[this.colorIndex++]
  }

  getModuleBackgroundColor(isFullScreen) {
    return isFullScreen ? 'transparent' : '#FFFFFF'
  }

  getOrderBackgroundColor(isFullScreen) {
    return isFullScreen ? 'rgba(8,12,34, 0.9)' : '#FFFFFF'
  }

  getStatisticsBackgroundColor(isFullScreen) {
    return isFullScreen ? 'rgba(8,12,34, 0.7)' : '#FFFFFF'
  }

  getMerchandiseBackgroundColor(isFullScreen) {
    return isFullScreen ? 'rgba(8,12,34, 0.9)' : '#F5F7FA'
  }

  getQuickPanelStyle(isFullScreen, isHeightAuto = false) {
    const style = {
      width: '100%',
      height: '100%',
      background: this.getOrderBackgroundColor(isFullScreen),
    }
    // 投屏模式不需要border
    if (isFullScreen) {
      style.border = 'none'
    }
    if (isHeightAuto) {
      delete style.height
    }
    return style
  }

  getStatisticsHeight(isFullScreen) {
    return isFullScreen ? '130px' : '90px'
  }

  // 整体进度页 border
  getStatisticsBorder(isFullScreen) {
    return isFullScreen
      ? '0.5px solid #56A3F2'
      : '0.5px solid rgba(132, 148, 161, 0.3)'
  }
}

export default new UiStyle()
