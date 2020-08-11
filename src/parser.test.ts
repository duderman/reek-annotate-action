import parse from "./parser"
import Annotation from "./annotation"

import tempWrite from "temp-write"
import {promises as fs} from "fs"
import {resolve} from "path"

let mailformedFilePath: string
let jsonFilePath: string

beforeAll(async () => {
  mailformedFilePath = await tempWrite("yo", ".json")
  jsonFilePath = await tempWrite(`[
  {
    "context": "Smelly",
    "lines": [1],
    "message": "has no descriptive comment",
    "smell_type": "IrresponsibleModule",
    "source": "lib/test-gem/smelly.rb",
    "documentation_link": "https://github.com/troessner/reek/blob/v6.0.1/docs/Irresponsible-Module.md"
  },
  {
    "context": "Smelly#x",
    "lines": [2],
    "message": "has the name 'x'",
    "smell_type": "UncommunicativeMethodName",
    "source": "lib/test-gem/smelly.rb",
    "name": "x",
    "documentation_link": "https://github.com/troessner/reek/blob/v6.0.1/docs/Uncommunicative-Method-Name.md"
  }]`)
})

afterAll(async () => {
  await fs.unlink(mailformedFilePath)
  await fs.unlink(jsonFilePath)
})

it("fails with error when file is missing", async () => {
  try {
    await parse("asd")
  } catch (err) {
    const fullPath = resolve("asd")
    expect(err).toEqual(new Error(`File '${fullPath}' doesn't exist`))
  }
})

it("fails when json is invalid", async () => {
  try {
    await parse(mailformedFilePath)
  } catch (err) {
    expect(err).toEqual(new Error("Mailformed JSON"))
  }
})

it("parse offenses from all files", async () => {
  const annotations: Annotation[] = await parse(jsonFilePath)

  expect(annotations[0].message).toEqual(
    "[IrresponsibleModule] Smelly has no descriptive comment"
  )
  expect(annotations[0].properties.file).toEqual("lib/test-gem/smelly.rb")
  expect(annotations[0].properties.line).toEqual(1)
  expect(annotations[0].properties.col).toBeUndefined()

  expect(annotations[1].message).toEqual(
    "[UncommunicativeMethodName] Smelly#x has the name 'x'"
  )
  expect(annotations[1].properties.file).toEqual("lib/test-gem/smelly.rb")
  expect(annotations[1].properties.line).toEqual(2)
  expect(annotations[1].properties.col).toBeUndefined()
})
