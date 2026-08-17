import galley from './compiler'
import util from '../util'

export type Util = typeof util

export const noPartials = {
	import: (_: string) => Promise.resolve(''),
	basedir: '.',
}

/** Compile and render in one step — sync templates only */
export const render = async (
	template: string,
	data: object = {},
	options: Parameters<typeof galley>[1] = { includes: noPartials },
): Promise<string> => {
	const tpl = await galley(template, options)
	const result = tpl.render(data, util)
	if (result instanceof Promise) return result
	return result as string
}

/** Compile and render with allowCode: true */
export const renderCode = async (
	template: string,
	data: object = {},
): Promise<string> => {
	const tpl = await galley(template, { includes: noPartials, allowCode: true })
	return tpl.render(data, util) as Promise<string>
}

export { util }
