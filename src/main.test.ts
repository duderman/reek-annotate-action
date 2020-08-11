import * as process from "process"
import * as cp from "child_process"
import * as path from "path"
import {promises as fs} from "fs"
import tempWrite from "temp-write"

beforeAll(async () => {
  process.env["INPUT_PATH"] = await tempWrite(`[
  {
    "context": "Class",
    "lines": [1],
    "message": "stinks",
    "smell_type": "Stink",
    "source": "file.rb"
  },
  {
    "context": "Class2",
    "lines": [2],
    "message": "stinks even more",
    "smell_type": "StrongStink",
    "source": "file2.rb"
  }
]`)
})
afterAll(async () => {
  if (!process.env["INPUT_PATH"]) {
    return
  }
  await fs.unlink(process.env["INPUT_PATH"])
})
test("main run", () => {
  const ip = path.join(__dirname, "..", "lib", "main.js")
  const options: cp.ExecSyncOptions = {
    env: process.env
  }
  expect(cp.execSync(`node ${ip}`, options).toString()).toEqual(
    "::error file=file.rb,line=1::[Stink] Class stinks\n" +
      "::error file=file2.rb,line=2::[StrongStink] Class2 stinks even more\n"
  )
})
test("sets error", () => {
  const ip = path.join(__dirname, "..", "lib", "main.js")
  const options: cp.ExecSyncOptions = {
    env: {...process.env, INPUT_PATH: "/asd"}
  }
  cp.exec(`node ${ip}`, options, (error, stdout) => {
    expect(error).not.toBeUndefined()
    expect(stdout).toEqual("::error::File '/asd' doesn't exist\n")
  })
})
test("uses reek.json as a default path", () => {
  const ip = path.join(__dirname, "..", "lib", "main.js")
  const options: cp.ExecSyncOptions = {
    env: {...process.env, INPUT_PATH: undefined}
  }
  cp.exec(`node ${ip}`, options, (error, stdout) => {
    const fullpath = path.resolve("reek.json")
    expect(error).not.toBeUndefined()
    expect(stdout).toEqual(`::error::File '${fullpath}' doesn't exist\n`)
  })
})
