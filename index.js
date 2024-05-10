const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

// middlewere
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
app.use(express.json())


// mongodb code here 

const uri = "mongodb+srv://farjana:xgq072FRAR71AuGK@cluster0.rjjtc94.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const usersCollection = client.db('restaurant').collection('users');


        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const result  = await usersCollection.insertOne(user);
            res.send(result)
        })






        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






// base route api
app.get('/', (req, res) => {
    res.send('assignment eleven is running')
})
app.listen(port, () => {
    console.log('assignment eleven port is:', port)
})