import fs from 'fs-extra'
import path from 'path'

export function readDirRaw(projectDir) {
  return fs.promises.readdir(projectDir, {
    encoding: 'utf8',
    withFileTypes: true
  })
}

export function createPhysicalNamespaceRaw(projectDir, namespace) {
  const namespaceFolder = path.join(projectDir, `_${namespace}`)
  return fs.promises.mkdir(namespaceFolder, {
    mode: 0o755
  })
}

export async function deleteNamespaceRawRaw(projectDir, namespace) {
  // we include the stat because fs.remove from fs-extra does not
  // error if the folder does not exist. fs.promises.stat does
  const namespaceFolder = path.join(projectDir, `_${namespace}`)
  await fs.promises.stat(namespaceFolder)
  await fs.remove(namespaceFolder)
}

export async function fsCreateProject(projectDir, projectName, namespace) {
  if (namespace === 'default') {
    await fs.promises.mkdir
  }
}

export async function gatherProjects(projectDir, shouldGather) {
  let unfilteredProjectDirents
  try {
    unfilteredProjectDirents = await readDirRaw(projectDir)
  } catch (err) {
    throw new Error(`failed to read directory ${projectDir}`)
  }

  let projects = []
  for (const dirent of unfilteredProjectDirents) {
    // ignore non-directories
    if (!dirent.isDirectory()) continue

    // if project does not begin with underscore, test if the folder matches name
    if (!(dirent.name.slice(0, 1) === '_')) {
      if (shouldGather(dirent))
        projects.push({
          name: dirent.name,
          isDirectory: dirent.isDirectory(),
          isFile: dirent.isFile(),
          isSymbolicLink: dirent.isSymbolicLink()
        })
    }

    // projects with underscores hold other projects. test for those
    const subdirPath = path.join(projectDir, dirent.name)
    let unfilteredSubProjectDirents

    try {
      unfilteredSubProjectDirents = await readDirRaw(subdirPath)
    } catch (err) {
      throw new Error(`failed to read directory ${subdirPath}`)
    }
    for (let subDirent of unfilteredSubProjectDirents) {
      // ignore non-directories
      if (!subDirent.isDirectory()) continue

      if (shouldGather(subDirent))
        projects.push({
          name: subDirent.name,
          isDirectory: subDirent.isDirectory(),
          isFile: subDirent.isFile(),
          isSymbolicLink: subDirent.isSymbolicLink()
        })
    }
  }
  return projects
}

export async function pickProject(projectDir, shouldPick) {
  let unfilteredProjectDirents
  try {
    unfilteredProjectDirents = await readDirRaw(projectDir)
  } catch (err) {
    throw new Error(`failed to read directory ${projectDir}`)
  }

  for (const dirent of unfilteredProjectDirents) {
    // ignore non-directories
    if (!dirent.isDirectory()) continue

    // if project does not begin with underscore, test if the folder matches name
    if (!(dirent.name.slice(0, 1) === '_')) {
      if (shouldPick(dirent))
        return {
          name: dirent.name,
          isDirectory: dirent.isDirectory(),
          isFile: dirent.isFile(),
          isSymbolicLink: dirent.isSymbolicLink()
        }
    }

    // projects with underscores hold other projects. test for those
    const subdirPath = path.join(projectDir, dirent.name)
    let unfilteredSubProjectDirents
    try {
      unfilteredSubProjectDirents = await readDirRaw(subdirPath)
    } catch (err) {
      throw new Error(`failed to read directory ${subdirPath}`)
    }
    for (let subDirent of unfilteredSubProjectDirents) {
      // ignore non-directories
      if (!subDirent.isDirectory()) continue

      if (shouldPick(subDirent))
        return {
          name: subDirent.name,
          isDirectory: subDirent.isDirectory(),
          isFile: subDirent.isFile(),
          isSymbolicLink: subDirent.isSymbolicLink()
        }
    }
  }
}
