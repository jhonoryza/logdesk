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
          newContent += `
            <div class="w-full p-1 text-left text-sm border border-red-200 grid grid-cols-4">
                <span class="text-xs text-lime-700 mr-1 border-r border-neutral-400 col-span-1">
                    ${now}
                </span>
                <div class="text-xs col-span-3">
                    <p class="font-semibold text-orange-500">${data.content.values}</p>
                </div>
            </div>
            `
        })
      if (newContent != '') {
        document.getElementById('response').innerHTML = oldContent + newContent
        window.scrollTo(0, document.body.scrollHeight)
      }
    }
  })
})
