import express from 'express'
import bodyParser from 'body-parser'
import retry from 'async-retry'
import main from './index.js' 
import { addData } from './addData.js'
import { getCollectionHandles } from './getCollectionHandles.js'
import getYotpoStoreCode from './getYotpoStoreCode.js'

const RETRY = {
    retries: 1,
    onRetry: (err) => {
        console.error('🔸 retrying...', err)
    }
}

const app = express()
const port = 3000

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/run-script', async (req, res) => {
    const { domain, collection, options = {} } = req.body
    
    try {
    const result = await retry(() => main(domain, collection, options),
    RETRY
)

    console.log('Main function completed successfully:', result.success)
    res.status(200).json({ success: true, data: result.data })

    } catch (error) {
    console.error('Main function failed after retries:', error);
    res.status(500).json({ success: false, error })
    }
})

app.post('/get-collection-handles', async (req, res) => {
    const { domain, collection, options = {} } = req.body
    let tryCount = 0

    if(!domain || !collection) return
    
    try {
        let result = await retry(() => {
            if(options?.usePlaywright || tryCount >= 1 ) return main(domain, collection, options)
            else return getCollectionHandles(domain, collection, options)
        },
        {
            retries: 1,
            onRetry: (err) => {
                tryCount++
                console.error('🔸 retrying...', err)
            }
        })

    console.log('getCollectionHandles function completed successfully:', result?.success);
    res.status(200).json({ success: true, data: result?.data })

    } catch (error) {
    console.error('getCollectionHandles function failed after retries:', error);
    res.status(500).json({ success: false, error })
    }
})

app.post('/add-data', async (req, res) => {
    const { handleArr, domain, options = {} } = req.body
    
    try {
    const result = await retry(() => addData(handleArr, domain, options), 
    RETRY)

    console.log('addData function completed successfully:', result.success);
    res.status(200).json({ success: true, data: result.data })

    } catch (error) {
    console.error('addData function failed after retries:', error);
    res.status(500).json({ success: false, error })
    }
})

app.post('/get-yotpo-store-code', async (req, res) => {
    const { domain, handle } = req.body
    
    try {
    const result = await retry(() => getYotpoStoreCode(domain, handle), 
    RETRY)

    console.log('Main function completed successfully:', result.success);
    res.status(200).json({ success: true, data: result.res })

    } catch (error) {
    console.error('Main function failed after retries:', error);
    res.status(500).json({ success: false, error })
    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})