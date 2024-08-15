import axios from 'axios'
import * as cheerio from 'cheerio'

export async function getCollectionHandles(domain, collection, userOptions = {}) {
    const options = {
        ...userOptions,
        handleLocator: userOptions.handleLocator || 'div.card--product',
        attribute: userOptions.attribute || 'href',
    }

    try {
        const { data: html } = await axios.get(`https://${domain}/collections/${collection}`)
        const $ = cheerio.load(html)
        console.log('Gotten to collection', $('h1').text())

        const handles = []
        $(options.handleLocator).each((index, element) => {
            const href = $(element).attr(options.attribute)
            const handle = href.split('/').pop();
            handles.push(handle)
        })

        if(handles.length === 0) throw new Error('No handles found')
        const uniqueHandles = [...new Set(handles)]

        return {data: uniqueHandles, success: true}
    } catch (error) {
        console.error('Error fetching the collection page:', error)
        return { success: true, error }
    }
}