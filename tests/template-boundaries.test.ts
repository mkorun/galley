// Accepted end-tag neighbors are checked with real compiled output and fresh Chromium iframes.
import { expect, test } from 'bun:test'
import galley from '../index.js'
import util from '../util.js'
import { observeStrict } from '../differential/strict-browser.js'

test('G-23 template end-tag neighbors keep markers in title text', async () => {
	const starts = ['<template><table></template></table>', '<template><table><tbody><tr><td></template></td></tr></tbody></table>', '<template><div></template></div>', '<template/><table></template></table>']
	const cases = []
	for (const [index, start] of starts.entries()) {
		const source = start + '<col><title></template><a href="{ u }">x</a></title>'
		const template = await galley(source)
		cases.push({ id: `template-end-${index}`, html: await template.render({ u: 'javascript:M1=1 N1=2' }, util), kind: 'places' as const })
	}
	const readings = await observeStrict(cases)
	expect(readings).toHaveLength(starts.length)
	for (const reading of readings) {
		expect(reading.places).toEqual(['1|text:title'])
		expect(reading.urls).toEqual([])
	}
}, 10000)
