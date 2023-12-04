// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  toggleTop: function (on) {
    ipcRenderer.send('toggle:top', on)
  }
})

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('response').innerHTML = ''
  ipcRenderer.on('echo', (event, message) => {
    let oldContent = document.getElementById('response').innerHTML

    const now = new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    if (Array.isArray(message.data)) {
      let newContent = ''
      message.data
        // .slice()
        // .reverse()
        .forEach((data) => {
          if (data.type == 'log') {
            if (data.content.values.includes('<pre>')) {
              newContent += `<div> ${now} : </div> ${data.content.values}` + '<hr>'
              return
            } else {
              newContent += `<div> ${now} : ${data.content.values} </div>` + '<hr>'
              return
            }
          }
          if (data.type == 'custom') {
            newContent += `<div> ${now} : ${data.content.values} </div>` + '<hr>'
            return
          }
          if (data.type == 'carbon') {
            newContent += `<div> ${now} : ${data.content.values} </div>` + '<hr>'
            return
          }
        })
      if (newContent != '') {
        document.getElementById('response').innerHTML = oldContent + newContent
        window.scrollTo(0, document.body.scrollHeight)
      }
    }
  })
})
