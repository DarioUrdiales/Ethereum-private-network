const express = require("express")
const cors = require("cors")

const network = require("./ethers/config")

const app = express()

app.use(cors())

//Test API for check working
app.get("/hello", (req, res) => {
    res.send("Hello")
})

/**
 * Returns info from the last 10 blocks
 */
app.get("/api/blocks", async (req, res) => {
    try {
        const currentBlock = await network.getBlockNumber()

        if (currentBlock == 0) 
            return res.status(404).json({message: "No blocks on network"})

        const blocks = []

        for (let index = 0; index < 10; index++) {
            const block = await network.getBlock(currentBlock - index)
            blocks.push(block)  
        }

        res.json(blocks)
    } catch (error) {
        res.status(500).json(error)
    }
})

/**
 * Returns info from specific block
 */
app.get("/api/blocks/:block", async (req, res) => {
    const blockNumber = req.params.block
    try {
        res.json(await network.getBlock(parseInt(blockNumber)))
    } catch (error) {
        res.status(500).json(error.message)
    }
})


module.exports = app