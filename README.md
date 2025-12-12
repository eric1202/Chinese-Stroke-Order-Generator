# 汉字笔顺动画GIF生成器

基于 Hanzi Writer + Puppeteer 生成汉字笔顺动画GIF。

## 安装依赖

```bash
npm install
```

## 使用方法

生成指定汉字的笔顺动画GIF：

```bash
npm run generate 中
```

或者直接运行：

```bash
node generate.js 中
```

如果不指定汉字，默认生成"中"字的动画。

## 输出

生成的GIF文件保存在 `output/` 目录下，文件名格式为 `{汉字}.gif`

## 配置

可以在 `generate.js` 中修改以下配置：

- `width`: 画布宽度（默认200）
- `height`: 画布高度（默认200）
- `fps`: 帧率（默认15）
- `outputDir`: 输出目录（默认./output）

## 技术栈

- **Hanzi Writer**: 汉字笔顺动画渲染
- **Puppeteer**: 无头浏览器，用于录制动画
- **GIFEncoder**: GIF文件生成
- **Canvas**: 图像处理

