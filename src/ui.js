import JSON5 from 'json5'
import { w2layout, w2toolbar, w2utils, query } from 'w2ui'
import { CodeEditor } from './edit.js'

class u2settings {
    static url = {
        prefix: null
    }
}

class u2toolbar {
    constructor(ui) {
        this.ui = ui
        this.layoutId = '0'
        this.x = new w2toolbar({
            name: 'x2toolbar',
            items: [
                { type: 'menu', id: 'layout',
                    icon: (item) => {
                        let selectedItem = item.get(item.selected)
                        if (['2', '4'].includes(selectedItem.id)) {
                            const menuId = `#tb_${this.x.name}_item_${item.id}`
                            Object.values([100, 200, 500, 1000, 2000]).forEach(timeout => {
                                setTimeout(() => {
                                    let menu = this.x.box.querySelector(menuId);
                                    if (menu && !menu.style.transform) {
                                        menu.style.transform = 'rotate(90deg)'
                                    }
                                }, timeout)
                            })
                        }
                        return selectedItem?.icon
                    },
                    selected: this.layoutId,
                    items: [
                        { id: '0', text: ' ', icon: 'bi bi-app' },
                        { id: '1', text: ' ', icon: 'bi bi-layout-split' },
                        { id: '2', text: ' ', icon: 'bi bi-layout-split', style: 'transform: rotate(90deg)' },
                        { id: '3', text: ' ', icon: 'bi bi-layout-three-columns' },
                        { id: '4', text: ' ', icon: 'bi bi-layout-three-columns', style: 'transform: rotate(90deg)' },
                    ]
                },
                { type: 'break' },
                { type: 'spacer' },
            ],
            onClick: (event) => {
                this.show(event.target)
            }
        })
        this.render()
    }
    get height() {
        return this.x.box.offsetHeight
    }
    static isHorizontal(layoutId) {
        return ['0', '1', '3'].includes(layoutId)
    }
    static isVertical(layoutId) {
        return ['2', '4'].includes(layoutId)
    }
    getLayoutId(id) {
        let layoutId = ''
        const index = id.indexOf(':')
        if (index >= 0) {
            layoutId = id.substring(index + 1)
        }
        return layoutId
    }
    render() {
        const dom = document.createElement('div')
        dom.id = this.x.name
        document.body.appendChild(dom)
        this.x.render(`#${dom.id}`)
    }
    show(id) {
        const layoutId = this.getLayoutId(id)
        switch (id) {
            case 'layout:0':
                this.ui.layout.show('left', '100%', layoutId, true)
                this.ui.layout.hide('main')
                this.ui.layout.hide('right')
                this.ui.layout.hide('top')
                this.ui.layout.hide('bottom')
                break
            case 'layout:1':
                this.ui.layout.show('left', '50%', layoutId, false)
                this.ui.layout.show('main', '50%', layoutId, true)
                this.ui.layout.hide('right')
                this.ui.layout.hide('top')
                this.ui.layout.hide('bottom')
                break
            case 'layout:2':
                this.ui.layout.show('top', '50%', layoutId, false)
                this.ui.layout.show('main', '50%', layoutId, true)
                this.ui.layout.hide('left')
                this.ui.layout.hide('right')
                this.ui.layout.hide('bottom')
                break
            case 'layout:3':
                this.ui.layout.show('left', '33%', layoutId, false)
                this.ui.layout.show('main', '34%', layoutId, false)
                this.ui.layout.show('right', '33%', layoutId, true)
                this.ui.layout.hide('top')
                this.ui.layout.hide('bottom')
                break
            case 'layout:4':
                this.ui.layout.show('top', '33%', layoutId, false)
                this.ui.layout.show('main', '34%', layoutId, false)
                this.ui.layout.show('bottom', '33%', layoutId, true)
                this.ui.layout.hide('left')
                this.ui.layout.hide('right')
                break
        }
        if (layoutId) {
            this.ui.layout.swap(this.layoutId, layoutId)
            this.layoutId = layoutId
        }
    }
}

class u2panel {
    constructor(layout, name) {
        this.layout = layout
        this.name = name
        this.id = { main: 0, left: 1, right: 2, top: 3, bottom: 4 }[name].toString()
        this.border = '1px solid gray'
        this.escape_selected = false
        this.toolbar_meta = {
            style: this.style(true),
            items: [
                { type: 'menu', id: 'index',
                    icon: (item) => {
                        return item.get(this.id)?.icon
                    },
                    selected: this.id,
                    items: [
                        { id: '0', text: ' ', icon: 'bi bi-2-circle', hidden: this.id == '0' },
                        { id: '1', text: ' ', icon: 'bi bi-1-circle', hidden: this.id == '1' },
                        { id: '2', text: ' ', icon: 'bi bi-3-circle', hidden: this.id == '2' },
                        { id: '3', text: ' ', icon: 'bi bi-1-circle', hidden: this.id == '3' },
                        { id: '4', text: ' ', icon: 'bi bi-3-circle', hidden: this.id == '4' },

                    ]
                },
                { type: 'menu', id: 'mode',
                    text: (item) => {
                        return item.get(item.selected)?.text
                    },
                    selected: 'json',
                    items: [
                        { id: 'command', text: 'cmd' },
                        { id: 'json', text: 'json' },
                        { id: 'python', text: 'python' },
                    ]
                },
                { type: 'radio', id: 'contract', group: '1', icon: 'bi bi-chevron-contract' },
                { type: 'radio', id: 'expand', group: '1', icon: 'bi bi-chevron-expand' },
                { type: 'button', id: 'copy', icon: 'bi bi-copy' },
                { type: 'menu-check', id: 'more', icon: 'bi bi-three-dots',
                    selected: [],
                    items: [
                        { id: 'escape', text: 'escape', icon: 'bi bi-escape' }
                    ]
                }
            ],
            onClick: (event) => {
                switch (event.target) {
                    case 'index:0':
                        this.swapDoc('main')
                        break
                    case 'index:1':
                        this.swapDoc('left')
                        break
                    case 'index:2':
                        this.swapDoc('right')
                        break
                    case 'index:3':
                        this.swapDoc('top')
                        break
                    case 'index:4':
                        this.swapDoc('bottom')
                        break
                    case 'contract':
                    case 'expand':
                        let mode = this.toolbar.get('mode').selected
                        let action = event.target
                        if (mode == 'json') {
                            this.json(mode, action)
                        } else {
                            this.request(mode, action)
                        }
                        break
                }
            },
            onRefresh: (event) => {
                switch (event.target) {
                    case 'more':
                        let more = this.toolbar.get('more').selected
                        if (more.includes('escape')) {
                            this.escape_selected = true
                        } else {
                            this.escape_selected = false
                        }
                        break
                }
            }
        }
        this.editor = null
    }
    get panel() {
        return this.layout.x.get(this.name)
    }
    get toolbar() {
        return this.panel.toolbar
    }
    get height() {
        return this.panel.height - this.toolbar.box.offsetHeight - 2
    }
    render() {
        this.editor = new CodeEditor(this.name, this.height)
        this.layout.x.html(this.name, this.editor.get('html'))
        this.editor.render()
    }
    notify(text, error) {
        if (text) {
            w2utils.notify(text, {
                class: 'u2notify',
                timeout: 30_000,
                error: error ? true : false,
            })
        } else {
            query(document.body).find('#w2ui-notify').remove()
        }
    }
    style(toolbar) {
        let v = `border: ${this.border}; border-left: none;`
        if (toolbar) {
            v += 'border-bottom: none;'
        } else {
            v += 'border-top: none; border-bottom: none;'
        }
        return v
    }
    swapDoc(name) {
        let origin = this.editor
        let target = this.layout.panels[name].editor
        if (origin && target) {
            let odoc = origin.get('doc')
            let tdoc = target.get('doc')
            origin.set({ doc: tdoc })
            target.set({ doc: odoc })
        }
    }
    parseDoc(doc) {
        let obj = null
        try {
            obj = JSON5.parse(doc);
        } catch (error) {
            try {
                obj = Function(`return ${doc}`)()
            } catch (error) {
                this.notify(`${error}`)
            }
        }
        return obj
    }
    json(mode, action) {
        if (this.escape_selected) {
            this.request(mode, action)
        } else {
            let doc = this.editor.get('doc')
            if (/\\"/.test(doc)) {
                this.request(mode, action)
            } else {
                let obj = this.parseDoc(doc)
                if (obj) {
                    let indent = action == 'expand' ? 4 : 0
                    let data = JSON.stringify(obj, null, indent)
                    this.editor.set({ doc: data })
                    this.notify()
                } else {
                    this.request(mode, action)
                }
            }
        }
    }
    request(mode, action) {
        const prefix = u2settings.url.prefix || ''
        const params = new URLSearchParams({
            escape: this.escape_selected
        }).toString();
        const url = `${prefix}/${mode}/${action}?${params}`
        const contentType = 'text/plain'
        const doc = this.editor.get('doc')
        fetch(url, {
            method: 'POST',
            body: doc,
            headers: {
                'Content-Type': contentType
            }
        })
        .then(response => {
            if (response.ok) {
                return response.text()
            } else {
                throw new Error('HTTP status = ' + response.status)
            }
        })
        .then(data => {
            this.editor.set({ doc: data })
            this.notify()
        })
        .catch(error => {
            console.error(error)
        })
    }
}

class u2layout {
    constructor(ui) {
        this.ui = ui
        this.immediate = true
        this.panels = {
            main: new u2panel(this, 'main'),
            left: new u2panel(this, 'left'),
            right: new u2panel(this, 'right'),
            top: new u2panel(this, 'top'),
            bottom: new u2panel(this, 'bottom'),
        }
        this.x = (() => {
            let initPanel = (name) => {
                let panel = this.panels[name]
                return {
                    type: name,
                    size: name == 'main' ? '34%' : '33%',
                    style: panel.style(false),
                    toolbar: panel.toolbar_meta,
                    resizable: true,
                    hidden: name == 'main' ? false : true,
                }
            }
            return new w2layout({
                name: 'x2layout',
                padding: 0,
                panels: [
                    initPanel('main'),
                    initPanel('left'),
                    initPanel('right'),
                    initPanel('top'),
                    initPanel('bottom'),
                ],
            })
        })()
        this.render()
    }
    get height() {
        return window.innerHeight - this.ui.toolbar.height
    }
    resize() {
        this.x.box.style.height = `${this.height}px`
    }
    render() {
        const dom = document.createElement('div')
        dom.id = this.x.name
        dom.style = `width: 100%; height: ${this.height}px;`
        document.body.appendChild(dom)

        this.x.render(`#${dom.id}`)
        this.x.on('*', (event) => {
            switch (event.type) {
                case 'show':
                    if (['main', 'left', 'right', 'top', 'bottom'].includes(event.target)) {
                        let panel = this.panels[event.target]
                        if (!panel.editor) {
                            panel.render()
                        }
                    }
                    break
                case 'resize':
                    const panel = event.detail.panel
                    const diff_y = event.detail.diff_y
                    if (panel == 'all' || diff_y != 0) {
                        Object.values([10, 50, 100, 300, 1000]).forEach(timeout => {
                            setTimeout(() => {
                                this.ui.resize()
                            }, timeout)
                        })
                    }
                    break
            }
        })
    }
    set(name, options) {
        let panel = this.panels[name]
        if (options?.layoutId) {
            const layoutTable = {
                '0': [1],
                '1': [1, 0],
                '2': [3, 0],
                '3': [1, 0, 2],
                '4': [3, 0, 4],
            }
            const layoutPanels = layoutTable[options.layoutId]
            let index = this.x.get(name).toolbar.get('index')
            Object.values([0, 1, 2, 3, 4]).forEach(id => {
                let sameId = panel.id == id.toString()
                index.get(id).hidden = sameId || !layoutPanels.includes(id)
            })
        }
        if (options.hasOwnProperty('lastFlag')) {
            if (options?.layoutId) {
                let borderRight = options.lastFlag ? 'none' : panel.border
                if (u2toolbar.isHorizontal(options.layoutId)) {
                    this.x.get(name).toolbar.box.style.borderRight = borderRight
                    this.x.el(name).style.borderRight = borderRight
                } else if (u2toolbar.isVertical(options.layoutId)) {
                    this.x.get(name).toolbar.box.style.borderRight = 'none'
                    this.x.el(name).style.borderRight = 'none'
                }
            }

            let resizable = options.lastFlag ? false : true
            this.x.get(name).resizable = resizable
            if (name == 'left' || name == 'top') {
                let resizerId = `#layout_${this.x.name}_resizer_${name}`
                let resizer = query(this.x.box).find(resizerId)
                if (resizable) {
                    resizer.show()
                } else {
                    resizer.hide()
                }
            }
        }
    }
    show(name, size, layoutId, lastFlag) {
        this.x.sizeTo(name, size, this.immediate)
        this.x.show(name, this.immediate)
        this.set(name, {
            layoutId: layoutId,
            lastFlag: lastFlag,
        })
    }
    hide(name) {
        this.x.hide(name, this.immediate)
    }
    swap(fromId, toId) {
        const isH2V = u2toolbar.isHorizontal(fromId) && u2toolbar.isVertical(toId)
        const isV2H = u2toolbar.isVertical(fromId) && u2toolbar.isHorizontal(toId)
        if (isH2V || isV2H) {
            this.panels['left'].swapDoc('top')
            this.panels['right'].swapDoc('bottom')
            this.ui.resize()
        }
    }
}

class UI {
    constructor() {
        this.toolbar = new u2toolbar(this)
        this.layout = new u2layout(this)
        this.toolbar.show('layout:0')
        this.resize()
        this.addEvents()
    }
    addEvents() {
        window.addEventListener('resize', () => {
            this.resize()
        })
    }
    resize() {
        this.layout.resize()
        Object.values(this.layout.panels).forEach(panel => {
            let editor = panel.editor
            if (editor instanceof CodeEditor) {
                editor.resize(panel.height)
            }
        })
    }
}

export { UI, u2settings as UISettings }