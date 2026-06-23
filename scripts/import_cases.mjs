import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const sourceDataPath = path.join(rootDir, 'awesome-gpt-image-2-main/data/cases.json')
const sourceImageDir = path.join(rootDir, 'awesome-gpt-image-2-main/data')

const targetDir = path.join(rootDir, 'public/cases')
const targetImageDir = path.join(targetDir, 'images')
const targetDataPath = path.join(targetDir, 'data.json')

if (!fs.existsSync(targetImageDir)) {
  fs.mkdirSync(targetImageDir, { recursive: true })
}

async function run() {
  console.log('Reading cases.json...')
  const rawData = fs.readFileSync(sourceDataPath, 'utf-8')
  const data = JSON.parse(rawData)

  const cases = data.cases || []
  console.log(`Found ${cases.length} cases. Processing...`)

  const extractedCases = []

  let count = 0
  for (const c of cases) {
    // The image path in cases.json is e.g. "/images/case508.jpg"
    const srcImgRelPath = c.image.replace(/^\//, '') // "images/case508.jpg"
    const srcImgAbsPath = path.join(sourceImageDir, srcImgRelPath)

    if (!fs.existsSync(srcImgAbsPath)) {
      console.warn(`Image not found: ${srcImgAbsPath}`)
      continue
    }

    const ext = path.extname(srcImgAbsPath)
    const baseName = path.basename(srcImgAbsPath, ext)
    const newFileName = `${baseName}.webp`
    const targetImgAbsPath = path.join(targetImageDir, newFileName)
    const targetUrl = `/cases/images/${newFileName}`

    // Compress using sharp
    if (!fs.existsSync(targetImgAbsPath)) {
      try {
        await sharp(srcImgAbsPath)
          .resize({ width: 300, withoutEnlargement: true })
          .webp({ quality: 60 })
          .toFile(targetImgAbsPath)
      } catch (e) {
        console.error(`Failed to process ${srcImgAbsPath}:`, e)
        continue
      }
    }

    extractedCases.push({
      id: c.id,
      title: c.title,
      prompt: c.prompt,
      image: targetUrl,
      category: c.category || 'Uncategorized'
    })

    count++
    if (count % 50 === 0) {
      console.log(`Processed ${count} images...`)
    }
  }

  fs.writeFileSync(targetDataPath, JSON.stringify(extractedCases, null, 2), 'utf-8')
  console.log(`Successfully processed ${count} cases. Data written to public/cases/data.json`)
}

run().catch(console.error)
