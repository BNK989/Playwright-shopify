import fs from 'fs'
import { parse } from 'json2csv'

export function cleanProductData(products) {
    return products.map(p => ({
        id: p.id.split('/').pop(),  // Extract the last part of the id string
        title: p.title,
        fullPrice: parseFloat(p.fullPrice.replace(/[^0-9.]/g, '').replace(/^\./,'')),  // Remove non-numeric characters and convert to float
        price: parseFloat(p.price.replace(/[^0-9.]/g, '')),  // Remove non-numeric characters and convert to float
        imgUrl: p.imgUrl
    }));
}

export const takeScreenShot = async (page, log) => {
    console.log(log ? log + ' 📸 ' : 'Taking screenshot to page.png')
    const folderName = `screenshots/${page.url().replace('.', '-')}`	 
    await fs.promises.mkdir(folderName, { recursive: true })
    const path = `${folderName}/${log ? log : Date.now()}.png`
    await page.screenshot({ path })
}


export function filterColorTags(tagString) {
    const tags = tagString.split(', ')
    const colorTags = tags.filter(tag => tag.startsWith('__color'))
    return colorTags.join(', ')
}


export function getDomain(url) {
    const domainUrl = url.match(/[^/]*\.[^/]*/)[0]
    return domainUrl
}

// export function jsonToCsv(json) {
//     // const fields = Object.keys(json[0])
//     // const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
//     // const csv = json.map(row => fields.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
//     // return csv.join('\r\n')
//     return parse(json)
// }
    // const products = await fs.promises.readFile('results.json', {encoding: 'utf8'}).then(p => JSON.parse(p))
    // console.log('products.length:', products.length)
    // const csv = parse(products)
    // fs.writeFile('csvFilePath.csv', csv, (err) => {
    //     if (err) {
    //       console.error('Error writing CSV file:', err);
    //       return;
    //     }
    // })
    // console.log('products:', products)
    // console.log(cleanProductData(products))