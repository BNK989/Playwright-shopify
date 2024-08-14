import axios from 'axios'
import * as cheerio from 'cheerio'

export async function getCollectionHandles(domain, collection) {
    try {
        const { data: html } = await axios.get(`https://${domain}/collections/${collection}`)
        const $ = cheerio.load(html)
        console.log('Gotten to collection', $('h1').text())

        const productHandles = []
        $('.product-card__image').each((index, element) => {
            const href = $(element).attr('href')
            const handle = href.split('/').pop();
            productHandles.push(handle)
        })
        console.log('productHandles:', productHandles)

        return {data: productHandles, success: true}
    } catch (error) {
        console.error('Error fetching the collection page:', error)
        return {data: [], success: true, error}
    }
}