import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  fileURLToPath(new URL('../src/client/QuestionComposer.module.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, ' ')

/** Return declarations from one authored CSS Module rule. */
function declarations(selector: string): string[] {
  const escaped = selector.replace(/[.[\]():*+^$\\,\s]/g, '\\$&')
  const rule = new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^{}]*)\\}`).exec(css)
  if (rule === null) throw new Error(`QuestionComposer.module.css has no rule for ${selector}`)
  return (rule[1] ?? '').split(';').map(part => part.trim()).filter(Boolean)
}

describe('QuestionComposer long-content layout', () => {
  it('bounds the complete question in a disclosure region and wraps long tokens', () => {
    expect(declarations('.headingBlock')).toEqual(expect.arrayContaining([
      'max-height: min(10vh, 52px)',
      'overflow: hidden',
    ]))
    expect(declarations('.header')).toEqual(expect.arrayContaining([
      "grid-template: 'heading actions' auto 'toggle actions' auto / minmax(0, 1fr) auto",
      'flex-shrink: 0',
    ]))
    expect(declarations('.headingBlockExpanded')).toEqual(expect.arrayContaining([
      'max-height: min(60vh, 360px)',
      'overflow-y: auto',
      'overscroll-behavior: contain',
    ]))
    expect(declarations('.headingToggle')).toEqual(expect.arrayContaining([
      'grid-area: toggle',
      'justify-self: start',
      'margin-top: 2px',
    ]))
    expect(declarations('.headingDisclosureSpacer')).toEqual(expect.arrayContaining([
      'grid-area: toggle',
      'min-height: 32px',
      'pointer-events: none',
    ]))
    expect(declarations('.title')).toContain('overflow-wrap: anywhere')
  })

  it('bounds the detail, independently scrolls choices, and keeps actions fixed', () => {
    expect(declarations('.detail')).toEqual(expect.arrayContaining([
      'max-height: min(12vh, 72px)',
      'overflow: hidden',
    ]))
    expect(declarations('.detailToggle')).toContain('margin: 0 2px 4px')
    expect(declarations('.detailExpanded')).toEqual(expect.arrayContaining([
      'max-height: min(48vh, 320px)',
      'overflow-y: auto',
      'overscroll-behavior: contain',
    ]))
    expect(declarations('.body')).toEqual(expect.arrayContaining([
      'flex: 1 1 auto',
      'min-height: 0',
      'overflow: hidden',
    ]))
    expect(declarations('.options')).toEqual(expect.arrayContaining([
      'flex: 1 1 auto',
      'min-height: 0',
      'overflow-y: auto',
      'overscroll-behavior: contain',
    ]))
    expect(declarations('.footer')).toContain('flex-shrink: 0')
  })
})
