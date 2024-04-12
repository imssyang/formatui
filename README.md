## Formatify

<img align="center" width="1147px" src="https://github.com/imssyang/formatify/blob/main/snapshot/layout-3.png">

Formatify is a text-formatted view used on browser. It aims to convert various text formats in place, such as json to python-dict.

## Feature

- Adaptive browser window size.
- Multiple window layout styles, which can be switched freely.
- Support search and replace windows.
- Support swapping editor content.

## Dependencies

* [W2UI](https://github.com/vitmalina/w2ui): a modern JavaScript UI library for building rich web applications.
* [codemirror6](https://codemirror.net/): a code editor component for the web.
* [bootstrap-icons](https://icons.getbootstrap.com/): Free, high quality, open source icon library with over 2,000 icons.
* [json5](https://json5.org/): an extension to the popular JSON file format that aims to be easier to write and maintain by hand.

### Commands

For Node.js:

```bash
# compile to a ES6 module
npm run build[:dev]

# run simple server (hot-reload), and open http://localhost:5015 in browser
npm run serve
```

## Why

Various texts in the development and debugging environment exist either in machine reading form or in human reading form, and often need to be converted into forms. Online conversion can often only meet some scenarios, and has a single function and is not user-friendly. Therefore, it is necessary to leverage the power of the open source community to create a universal text converter that is easy to use and can be continuously optimized.

## Todo

- Vertical multi-window layout
- History list
- Indent control
- Clipboard

## License

[Apache License 2.0](https://github.com/imssyang/formatify/blob/main/LICENSE)