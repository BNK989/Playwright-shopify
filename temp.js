import fs from 'fs'


async function main(){
    const data = {test: 1, test2: 2}
    await fs.promises.writeFile('results.json', JSON.stringify(data, null, 2))
}
main()