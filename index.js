import pw from 'playwright'
import fs from 'fs'
import { cleanProductData, takeScreenShot } from './utiles.js'
import { parse } from 'json2csv'

const SBR_CDP = `wss://${process.env.SBR_USERNAME}:${process.env.PASSWORD}@${process.env.HOST}`
const isLocal = true

export default async function main(domain = 'testshop.com', collectionName = 'new-in', userOptions ) {
    const options = {
        ...userOptions, 
        maxProducts: userOptions.maxProducts || 30, 
        minProducts: userOptions.minProducts || 1,
        outputFormat: userOptions.outputFormat || 'csv'
    }
    if (!isLocal) console.log('🟡 Connecting to scraping browser...')
    const browser = isLocal ? null : await pw.chromium.connectOverCDP(SBR_CDP)
    const localBrowser = isLocal ? await pw.chromium.launch({ headless: true }) : null
    const context = isLocal ? await localBrowser.newContext() : null

    console.log('🟢 Connected! Navigating...')
    const page = isLocal ? await context.newPage() : await browser.newPage()

    try{
        await page.goto(`https://${domain}/collections/${collectionName}`, {
            timeout: 3 * 60 * 1000
        })
        console.log('Navigated! Scrapping page content')
        // await page.locator('button.recommendation-modal__close-button').click()
        
        await takeScreenShot(page, 'got page')

        
        const data = []
        let products = []
        let atm = 0
        while(products.length < options.minProducts || atm < 3) {
            products = await page.locator('product-card.product-card').all()
            atm++
        }

        for( const p of products){
        
            // console.log('title', await products.locator('div.product-card__title').allInnerTexts())
            const product = {
                id: await p.locator('a.product-card__image').first().getAttribute('href') || '',
                title: await p.locator('div.product-card__title').allInnerTexts().then(v => v[0]) || '',
                fullPrice: await p.locator('.strike-through-price').allInnerTexts().then(v => v[0]) || 0,
                price: await p.locator('.price-highlight').allInnerTexts().then(v => v[0]) || 0,
                imgUrl: await p.locator('img').first().getAttribute('src').then(src => src.substring(2)) || '',
            }

            data.push(product)
        }

        console.log('Total products data', data.length)
        
        if (!data.length) throw new Error('no items found')
        const cleanedData = cleanProductData(data)
        const folderName = `data/${domain.replace('.', '-')}`	 
        await fs.promises.mkdir(folderName, { recursive: true })
        await fs.promises.writeFile(`${folderName}/base-${domain}-${collectionName}-${Date.now()}.json`, JSON.stringify(cleanedData, null, 2))
        await fs.promises.writeFile(`${folderName}/base-${domain}-${collectionName}-${Date.now()}.csv`, parse(cleanedData))
        return {success: true, data: cleanedData}

    } catch(err) {
        await takeScreenShot(page, 'Error')
        console.error("there was an error", err)
        return {success: false, error: err}

    } finally {
        console.log('🔴 Closing browser...')
        isLocal ? await localBrowser.close() : await browser.close()
    }
    
}