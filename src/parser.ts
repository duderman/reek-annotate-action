import Annotation, {AnnotationProperties} from "./annotation"
import {promises as fs} from "fs"
import {resolve} from "path"

type Offense = {
  context: string
  lines: number[]
  message: string
  source: string
  smell_type: string
  documentation_link: string
}

type StatError = {
  code: string
}

function isErrorNotFound(err: StatError): boolean {
  return err.code === "ENOENT"
}

async function checkFileExistance(path: string): Promise<void> {
  try {
    await fs.stat(path)
  } catch (err) {
    if (isErrorNotFound(err)) {
      throw new Error(`File '${path}' doesn't exist`)
    }

    throw err
  }
}

async function read(path: string): Promise<string> {
  const fullPath: string = resolve(path)
  await checkFileExistance(fullPath)
  return await fs.readFile(fullPath, "utf8")
}

function buildAnnotationFromOffense(offense: Offense): Annotation {
  const message = `[${offense.smell_type}] ${offense.context} ${offense.message}`
  const properties: AnnotationProperties = {
    file: offense.source,
    line: offense.lines[0]
  }

  return new Annotation(message, properties)
}

function parseOffenses(offenses: Offense[]): Annotation[] {
  return offenses.map(buildAnnotationFromOffense)
}

function parseJSON(contents: string): Offense[] {
  try {
    return JSON.parse(contents)
  } catch (err) {
    throw new Error("Mailformed JSON")
  }
}

export default async function parse(filepath: string): Promise<Annotation[]> {
  const contents: string = await read(filepath)
  const offenses: Offense[] = parseJSON(contents)

  return parseOffenses(offenses)
}
