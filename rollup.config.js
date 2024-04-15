import fs from 'fs'
import path from 'path'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'
import livereload from 'rollup-plugin-livereload'
import postcss from 'rollup-plugin-postcss'
import serve from 'rollup-plugin-serve'

const isProd = process.env.NODE_ENV === 'production'
const isServe = process.env.NODE_ENV === 'server'

const APP = {
  name: 'formatui',
  host: '0.0.0.0',
  port: 5015,
}

const PATHS = {
  src: 'src',
  dist: 'dist',
  modules: 'node_modules',
}

const FILES = {
  src: {
    img: [
      { name: 'formatui.svg', to: 'img', when: [ 'serve' ] },
    ],
    html: [
      { name: 'index.html', when: [ 'serve' ] },
    ]
  },
  bootstrapIcons: {
    ver: '1.11.2',
    dir: 'font',
    css: isProd ? 'bootstrap-icons.min.css' : 'bootstrap-icons.css',
    extras: [ 'fonts' ],
  },
  json5: {
    ver: '2.2.3',
    dir: 'dist',
    js: isProd ? 'index.min.mjs' : 'index.mjs',
  },
  w2ui: {
    ver: '2.0.0',
    js: isProd ? 'w2ui-2.0.es6.min.js' : 'w2ui-2.0.es6.js',
    css: isProd ? 'w2ui-2.0.min.css' : 'w2ui-2.0.css',
  },
  url(name) {
    const info = this[name]
    const realName = this.realName(name)
    return `/plugins/${realName}@${info.ver}/${info.js}`
  },
  copySrc() {
    let items = []
    for (const [dir, files] of Object.entries(this.src)) {
      for (const file of files) {
        const okServe = isServe && file.when.includes('serve')
        if (okServe) {
          const src = path.join(PATHS.src, dir, file.name)
          if (this.checkPath(src)) {
            const dest = path.join(...[PATHS.dist, file?.to].filter(Boolean))
            items.push({ src: src, dest: dest })
          } else {
            throw new Error(`No valid src: ${src}`)
          }
        }
      }
    }
    return items
  },
  copyModules() {
    let items = []
    for (const [name, info] of Object.entries(this)) {
      if (typeof info !== 'function' && name !== 'src') {
        const realName = this.realName(name)
        for (const tail of [info?.js, info?.css, info?.extras]) {
          if (tail) {
            const tailings = typeof tail == 'string' ? [ tail ] : tail
            for (const tailing of tailings) {
              const src = path.join(...[PATHS.modules, realName, info?.dir, tailing].filter(Boolean))
              if (this.checkPath(src)) {
                const dest = path.join(PATHS.dist, 'plugins', `${realName}@${info.ver}`)
                items.push({ src: src, dest: dest })
              } else {
                throw new Error(`No valid src: ${src}`)
              }
            }
          }
        }
      }
    }
    return items
  },
  realName(name) {
    if (this.checkName(name)) { return name }
    const linkName = name.replace(/([a-z0-9])([A-Z])/g, (_m, p1, p2) => `${p1}-${p2.toLowerCase()}`)
    if (this.checkName(linkName)) { return linkName }
    const atName = `@${linkName}`
    if (this.checkName(atName)) { return atName }
    throw new Error(`No valid path: ${name}`)
  },
  checkName(name) {
    return this.checkPath(path.join(PATHS.modules, name))
  },
  checkPath(path) {
    try {
      fs.accessSync(path)
      return true
    } catch (error) {
      return false
    }
  }
}

export default {
  input: path.join(PATHS.src, 'index.js'),
  output: {
    file: path.join(PATHS.dist, isProd ? 'index.min.js' : 'index.js'),
    format: 'es',
    sourcemap: isProd ? false : true,
		paths: {
			json5: FILES.url('json5'),
      w2ui: FILES.url('w2ui'),
		}
  },
  external: [
    'json5',
    'w2ui',
  ],
  plugins: [
    del({
      targets: path.join(PATHS.dist, '*'),
    }),
    alias({
      entries: {}
    }),
    nodeResolve(),
    commonjs(),
    json(),
    postcss({
      extract: true,
      minimize: isProd,
    }),
    copy({
      verbose: true,
      targets: [
        ...FILES.copySrc(),
        ...FILES.copyModules(),
      ]
    }),
    isProd && terser(),
    isServe && serve({
      verbose: true,
      host: APP.host,
      port: APP.port,
      contentBase: [ PATHS.dist ],
    }),
    isServe && livereload({
      verbose: true,
      watch: [
        PATHS.dist,
        path.join(PATHS.src, 'html'),
        path.join(PATHS.src, 'css'),
      ]
    })
  ]
}
