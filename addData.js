import retry from 'async-retry'
import axios from 'axios'
import fs from 'fs'
import getYotpoStoreCode from './getYotpoStoreCode.js'
import { filterColorTags } from './utiles.js'

let yotpoStoreCode

export async function addData(handleArr, domain, options = {}) {
    console.log('addData:', 'handleArr', handleArr, 'domain', domain)

    if(options?.yotpoStoreCode) yotpoStoreCode = options.yotpoStoreCode

    const products = handleArr.map(h => ({ handle: h}))
    // const existingData = await fs.promises.readFile('data/results.json', {encoding: 'utf8'}).then(p => {
    //     if (p) {
    //         return JSON.parse(p)
    //     } else return []
    // })

    try {
        
        
        for( const p of products ) {

        // const existingInternalID = existingData.find(ep => ep.id === p.handle)
        // if (existingInternalID?.productInternalId && false) {
        //     p.productInternalId = existingInternalID.productInternalId
        // } else {
            // const productInternalId = await getProductInternalId(p.id)
            const url = `https://${domain}/products/${p.handle}.json`
            const productInternal = await axios.get(url).then(r => r.data.product)
            if (productInternal) {
                p.id = productInternal.id
                p.title = productInternal.title
                p.type = productInternal.product_type
                p.published_at = productInternal.published_at
                p.updated_at = productInternal.updated_at
                p.tags = productInternal.tags
                p.color_options = filterColorTags(productInternal.tags)
                p.price = parseFloat(productInternal.variants[0].price) || productInternal.variants[0].price
                p.compare_at_price = parseFloat(productInternal.variants[0].compare_at_price) || productInternal.variants[0].compare_at_price
                p.img = productInternal.images[0].src
            }
        // }

    }

    for( const p of products ) {
        const rating = await getRating(p.id, domain, p.handle)
        if (!isNaN(rating)) {
            p.rating = rating
            p.ratingUpdateAt = new Date()
        }
    }
    
    // const folderName = `data/${domain.replace('.', '-')}`	 
    // await fs.promises.mkdir(folderName, { recursive: true })
    
    // fs.writeFile(`${folderName}/results.json`, JSON.stringify(products, null, 2), (err) => {
    //     if (err) {
    //       console.error('Error writing JSON file:', err);
    //       return
    //     }
    // })

    // fs.writeFile(`${folderName}/csv-results.csv`, parse(products), (err) => {
    //     if (err) {
    //       console.error('Error writing CSV file:', err);
    //       return
    //     }
    // })
    
    return { success: true, data: products }
} catch (error) {
    console.error('addData function failed after retries:', error);
    return { success: false, error }
}
    
}

async function getRating (productInternalId, siteName, handle) {
    if(yotpoStoreCode === false) return
    if (!yotpoStoreCode) yotpoStoreCode = await getYotpoStoreCode(siteName, handle).then(r => r?.res)
    if(yotpoStoreCode === false) return
    const BASE_LINK = `https://api-cdn.yotpo.com/v3/storefront/store/${yotpoStoreCode}/product/`
    const res = await axios.get(`${BASE_LINK}${productInternalId}/ratings`).then(r => r.data)
    return res?.bottomline?.totalReviews
}