import express from 'express'
import bodyParser from 'body-parser'
import retry from 'async-retry'
import main from './index.js' 
import { addData } from './addData.js'

const app = express()
const port = 3000

app.use(bodyParser.json())

app.post('/run-script', async (req, res) => {
    const { domain, category, options = {} } = req.body
    
    try {
    const result = await retry(() => main(domain, category, options), {
        retries: 1,
        onRetry: (err) => {
            console.error('🔸 retrying...', err);
        },
    })

    console.log('Main function completed successfully:', result.success);
    res.status(200).json({ success: true, data: result.data })

    } catch (error) {
    console.error('Main function failed after retries:', error);
    res.status(500).json({ success: false, error })
    }
})

app.post('/add-data', async (req, res) => {
    const { handleArr, domainName } = req.body
    
    try {
    const result = await retry(() => addData(handleArr, domainName), {
        retries: 1,
        onRetry: (err) => {
            console.error('🔸 retrying...', err);
        },
    })

    console.log('addData function completed successfully:', result.success);
    res.status(200).json({ success: true, data: result.data })

    } catch (error) {
    console.error('addData function failed after retries:', error);
    res.status(500).json({ success: false, error })
    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})