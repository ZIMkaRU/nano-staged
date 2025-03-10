import { resolve, join } from 'path'
import { equal } from 'uvu/assert'
import { nanoid } from 'nanoid'
import { homedir } from 'os'
import { test } from 'uvu'

import { prepareFiles } from '../lib/prepare-files.js'
import { CHANGED_CODE, DELETED_CODE, STAGED_CODE } from '../lib/git.js'

let cwd = join(homedir(), 'nano-staged-' + nanoid())

let config = {
  '*.{css,js}': ['prettier --write'],
  '*.md': ['prettier --write'],
  '../*.ts': ['prettier --write'],
}
let entries = [
  { path: 'main/src/a.js', type: STAGED_CODE, rename: undefined },
  { path: 'b.js', type: CHANGED_CODE, rename: undefined },
  { path: 'c.css', type: STAGED_CODE, rename: undefined },
  { path: 'd.md', type: CHANGED_CODE, rename: undefined },
  { path: 'e.css', type: DELETED_CODE, rename: undefined },
  { path: 'f.ts', type: STAGED_CODE, rename: undefined },
  { path: '../j.ts', type: STAGED_CODE, rename: undefined },
  { path: 'a/b/c/j.js', type: STAGED_CODE, rename: undefined },
]

test(`shoulds prepare correctly files`, () => {
  let files = prepareFiles({
    repoPath: cwd,
    cwd,
    entries,
    config,
  })

  function resolvePaths(paths) {
    return paths.map((path) => resolve(cwd, path))
  }

  equal(files, {
    taskedFiles: [
      ['*.{css,js}', resolve(cwd, 'main/src/a.js')],
      ['*.{css,js}', resolve(cwd, 'b.js')],
      ['*.{css,js}', resolve(cwd, 'c.css')],
      ['*.{css,js}', resolve(cwd, 'e.css')],
      ['*.{css,js}', resolve(cwd, 'a/b/c/j.js')],
      ['*.md', resolve(cwd, 'd.md')],
      ['../*.ts', resolve(cwd, '../j.ts')],
    ],
    stagedFiles: resolvePaths([
      'main/src/a.js',
      'b.js',
      'c.css',
      'e.css',
      'a/b/c/j.js',
      'd.md',
      '../j.ts',
    ]),
    deletedFiles: resolvePaths(['e.css']),
    changedFiles: resolvePaths(['b.js', 'd.md']),
  })
})

test.run()
