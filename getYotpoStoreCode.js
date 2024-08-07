import pw from 'playwright'
import fs from 'fs'
import { takeScreenShot, getDomain } from './utiles.js'

const SBR_CDP = `wss://${process.env.SBR_USERNAME}:${process.env.PASSWORD}@${process.env.HOST}`
const isLocal = true

export default async function getYotpoStoreCode(url = 'https:/test-store/products/test-handle') {

    const storeName = getDomain(url)
    
    const existingData = await fs.promises.readFile('data/siteCodes.json', {encoding: 'utf8'})
      .then(d => d ? JSON.parse(d): [] )
    const dataIdx = existingData.findIndex(v => v.storeName === storeName)
    if( dataIdx > -1 ) return ({success: true, res: existingData[dataIdx].storeCode})

    if (!isLocal) console.log('🟡 Connecting to scraping browser...')
    const browser = isLocal ? null : await pw.chromium.connectOverCDP(SBR_CDP)
    const localBrowser = isLocal ? await pw.chromium.launch({ headless: true }) : null
    const context = isLocal ? await localBrowser.newContext() : null

    console.log('🟢 Connected! Navigating...')
    const page = isLocal ? await context.newPage() : await browser.newPage()


    try{
        const requests = []

        page.on('requestfinished', request => {
            const requestUrl = request.url()
            if (requestUrl.includes('yotpo')) {
              requests.push(requestUrl)
            }
          })

        await page.goto(url)
        await page.waitForTimeout(1000 * 20 )

        console.log('got requests', requests.length)
        const storeCodeRegex = /store\/(.*?)\/product/
        for (let requestUrl of requests) {
            const match = requestUrl.match(storeCodeRegex)
            if (match && match[1]) {
              console.log('Store Code:', match[1])
            existingData.push({storeName, storeCode: match[1]})
              fs.writeFile('data/siteCodes.json', JSON.stringify(existingData, null, 2), (err) => {
                if (err) {
                  console.error('Error writing JSON file:', err)
                  return
                }
            })
              return {success: false, res: match[1]}
            }
          }
        
          console.log('Store Code not found');

    } catch(err) {
        await takeScreenShot(page, 'Error')
        console.error("there was an error", err)
        return {success: false, error: err}

    } finally {
        console.log('🔴 Closing browser')
        isLocal ? await localBrowser.close() : await browser.close()
    }
    
}