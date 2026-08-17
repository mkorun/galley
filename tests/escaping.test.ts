import { describe, expect, test } from 'bun:test'
import { render } from './helpers'

describe('Backslash escaping of Chase tags', () => {

	test('\\{ escapes expression tag', async () => {
		expect(await render('\\{ meta.title }')).toBe('{ meta.title }')
	})

	test('\\{# escapes block tag', async () => {
		expect(await render('\\{#if show}yes\\{/if}', { show: true })).toBe('{#if show}yes{/if}')
	})

	test('\\{@ escapes directive', async () => {
		expect(await render('\\{@raw markup}')).toBe('{@raw markup}')
	})

	test('backslash only escapes immediately preceding tag', async () => {
		expect(await render('A\\{ expr }B{ title }', { title: 'T' })).toBe('A{ expr }BT')
	})

})
