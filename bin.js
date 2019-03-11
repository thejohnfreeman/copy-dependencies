#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')
const { combineLatest, concat, fromEvent } = require('rxjs')
const { reduce, switchMap } = require('rxjs/operators')
const { streamToRx } = require('rxjs-stream')

// TODO: Take last N bytes with .slice(-N). Do we need to make a copy to free
// the leading bytes or is Node smart enough?
const concatBuffers = (all, next) => Buffer.concat([all, next])
const emptyBuffer = Buffer.alloc(0)

const ERROR = 0
const WARNING = 1
const INFO = 2

function task(command, args) {
  const subprocess = spawn(command, args)
  const stdout = streamToRx(subprocess.stdout).pipe(
    reduce(concatBuffers, emptyBuffer),
  )
  const stderr = streamToRx(subprocess.stderr).pipe(
    reduce(concatBuffers, emptyBuffer),
  )
  const exit = fromEvent(subprocess, 'exit')
  return combineLatest([exit, stdout, stderr])
}

const package = require(path.resolve('package.json'))

if (!('copyDependencies' in package)) {
  console.error('missing copyDependencies in package.json')
  process.exit(1)
}

const level = ERROR

Object.entries(package.copyDependencies).forEach(([from, to]) => {
  const dir = to.endsWith(path.sep) ? to : path.dirname(to)
  concat(
    task('mkdir', ['--parents', dir]),
    task('rsync', ['--recursive', from, to]),
  ).subscribe(([[code, signal], stdout, stderr]) => {
    if (level >= INFO || code !== 0) {
      process.stdout.write(stdout)
      process.stderr.write(stderr)
    }
  })
})
