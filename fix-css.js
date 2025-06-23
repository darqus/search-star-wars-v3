// Script to fix CSS imports for tests
import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Path to the problematic CSS file
const cssFilePath = resolve(__dirname, 'node_modules/vuetify/lib/components/VCode/VCode.css')
const jsFilePath = resolve(__dirname, 'node_modules/vuetify/lib/components/VCode/VCode.css.js')

// Create a JavaScript module that will be loaded instead of the CSS file
const jsCssContent = 'export default {}\n'

// Create the directory if it doesn't exist
const dir = dirname(cssFilePath)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

// Create the JavaScript file
fs.writeFileSync(jsFilePath, jsCssContent)
console.log(`Created JS mock for CSS at: ${jsFilePath}`)

// Optionally rename the CSS file so it won't be found directly
if (fs.existsSync(cssFilePath)) {
  const backupPath = cssFilePath + '.backup'
  fs.renameSync(cssFilePath, backupPath)
  console.log(`Renamed original CSS file to: ${backupPath}`)
}
