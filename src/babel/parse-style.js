import postcss from 'postcss'
import path from 'path'
import sass from 'node-sass'
import CleanCSS from 'clean-css'

import { hashString } from '../utils'

import postcssSelector from '../plugins/postcss-selector'
import postcssImages from '../plugins/postcss-images'

//通过node-sass解析并获取style字符串
export const content = (givenPath) => sass.renderSync({ file: givenPath }).css.toString()

//postcss批量处理
const handlePostcss = (styles, plugins) => { 
	return new Promise(async (resolve, reject) => {							
		if (styles.length) {
			try {
				const style = await Promise.all(styles.map(async (item, index) => {
						//解析css样式
						const { css } = await postcss(plugins).process(item.css, { from: item.from })
						//压缩css文件
						const output = new CleanCSS({}).minify(css);
						return output.styles
					}))
					resolve(style.join(''))
				} catch (error) {
					reject(error)	
				}			
		} else { 
			resolve('')
		}
	})
}

//将css字符串经过postcss插件进行二次操作
export const parse = (plugins, state, config) => {

	let reference = state && state.file && state.file.opts.filename
	let imageOptions = state && state.opts && state.opts.imageOptions
	const write = state && state.opts && state.opts.write || true

	if (typeof imageOptions === 'undefined') { 
		imageOptions = {}
	}

	if (config.imageLimit) {
		imageOptions.limit = config.imageLimit
	}
	
	plugins = [
		...plugins,
		postcssImages({
			imageOptions,
			write
		})
	] 

	return new Promise(async (resolve, reject) => {
		try {
			let globalStyle = await handlePostcss(state.styles.global, plugins)
			let jsxStyle = await handlePostcss(state.styles.jsx, plugins)
			
			let styleId = jsxStyle === '' ? 0 : hashString(jsxStyle)

			if (styleId !== 0) {
				//拼接css-modules
				const { css } = await postcss([
					postcssSelector({ styleId, styleType: state.styleType })
				]).process(jsxStyle, { from: undefined })				
				jsxStyle = css
			}			

			resolve({
				global: globalStyle,
				jsx: jsxStyle,
				styleId
			})
				
		} catch (err) { 
			reject(err)
		}	
	})
}