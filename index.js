import pw from 'playwright'

const SBR_CDP = `wss://${process.env.SBR_USERNAME}:${process.env.PASSWORD}@${process.env.HOST}`
const isLocal = true

export default async function main(domain, collection, userOptions ) {
    const options = {
        ...userOptions, 
        maxProducts: userOptions.maxProducts || 30, 
        minProducts: userOptions.minProducts || 1,
        outputFormat: userOptions.outputFormat || 'csv',
        handleLocator: userOptions.handleLocator || 'div.card--product',
        attribute: userOptions.attribute || 'href',
    }
    if (!isLocal) console.log('🟡 Connecting to scraping browser...')
    const browser = isLocal ? null : await pw.chromium.connectOverCDP(SBR_CDP)
    const localBrowser = isLocal ? await pw.chromium.launch({ headless: true }) : null
    const context = isLocal ? await localBrowser.newContext() : null

    console.log('🟢 Connected! Navigating...')
    const page = isLocal ? await context.newPage() : await browser.newPage()

    try{
        await page.goto(`https://${domain}/collections/${collection}`, {
            timeout: 3 * 60 * 1000
        })
        console.log('Navigated! Scrapping page content')
        // await page.locator('button.recommendation-modal__close-button').click()
        
        const data = []
        let products = []
        let atm = 0
        while(products.length < options.minProducts || atm < 3) {
            // products = await page.locator('product-card.product-card').all()
            products = await page.locator(options.handleLocator).all()
            atm++
        }

        for( const p of products){
        
            const product = {
                handle: await p.getAttribute(options.attribute) || '',

            }

            data.push(product)
        }
        return {success: true, data: data.map(p => p.handle.split('/').pop())}

    } catch(err) {
        console.error("there was an error", err)
        return {success: false, error: err}

    } finally {
        console.log('🔴 Closing browser...')
        isLocal ? await localBrowser.close() : await browser.close()
    }
    
}