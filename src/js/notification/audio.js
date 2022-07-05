import { i18next } from 'gm-i18n'
import { Tip } from '@gmfe/react'
import _ from 'lodash'

class NAudio {
  constructor(name) {
    this._audio = new window.Audio()
    this.init(name)
  }

  init(name) {
    let url = '//js.guanmai.cn/static_storage/files'

    if (this._audio.canPlayType('audio/mp3')) {
      this._audio.src = `${url}/${name}.mp3`
    } else if (this._audio.canPlayType('audio/ogg')) {
      this._audio.src = `${url}/${name}.ogg`
    }
  }

  play = _.throttle(() => {
    if (!this._audio.src) {
      Tip.warning(i18next.t('没有可播放的音频格式'))
    } else {
      this._audio.currentTime = 0
      this._audio.play()
    }
  }, 4000)
}

export default new NAudio('order_audio')
