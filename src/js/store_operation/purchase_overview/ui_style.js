// 采购总览普通页面和全屏页面样式
class UiStyle {
  // 模块背景色
  getModalBackgroundColor(isFullScreen) {
    return {
      background: isFullScreen ? 'rgba(255,255,255, 0.05)' : '#FFFFFF',
      color: isFullScreen ? '#FFFFFF' : '',
    }
  }

  getMoneyModalBackgroundColor(isFullScreen) {
    return {
      background: isFullScreen ? 'rgba(23,35,70, 0.7)' : '#FFFFFF',
      color: isFullScreen ? '#FFFFFF' : '',
      height: '90px',
    }
  }
}

export default new UiStyle()
