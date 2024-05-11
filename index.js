const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const foodsCollection = client.db('restaurant').collection('foods');
        const purchaseCollection = client.db('restaurant').collection('purchase');



        app.get('/foods', async(req, res)=>{
            const result = await foodsCollection.find().toArray();
            res.send(result)
        })

        app.get('/foods/:email' ,async(req ,res)=>{
            const email= req.params.email;
            const query= {email : email}
            const result = await foodsCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/update/:id' , async(req, res)=>{
            const id = req.params.id;
            const query= {_id: new ObjectId(id)};
            const result = await foodsCollection.findOne(query);
            res.send(result)
        })

        app.get('/detail/:id' , async(req, res)=>{
            const id = req.params.id;
            const query= {_id: new ObjectId(id)};
            const result = await foodsCollection.findOne(query);
            res.send(result)
        })

        app.get('/myPurchase/:email', async(req , res)=>{
            const email = req.params.email;
            const query = {email:email}
            const result = await purchaseCollection.find(query).toArray();
            res.send(result)
        })

        app.put('/update/:id' , async(req, res)=>{
            const id = req.params.id;
            const info = req.body;
            console.log(info)
            const filter= {_id: new ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name :info.name,
                    imageURL:info.imageURL,
                    category :info.category,
                    quantity:info.quantity,
                    price:info.price,
                    addBy:info.addBy,
                    origin:info.origin,
                    textarea:info.textarea
                },
              };


            const result = await foodsCollection.updateOne(filter , updateDoc , options);
            res.send(result)
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const result  = await usersCollection.insertOne(user);
            res.send(result)
        })

        app.post('/foods', async (req, res) => {
            const user = req.body;
            console.log(user)
            const result  = await foodsCollection.insertOne(user);
            res.send(result)
        })

        app.post('/purchase' , async(req , res)=>{
            const purchaseData = req.body;
            console.log(purchaseData);
            const result = await purchaseCollection.insertOne(purchaseData);
            res.send(result)

        })


        app.delete('/foods-delete/:id' , async(req , res)=>{
            const id = req.params.id;
            const query = {_id:new ObjectId(id)};
            const result = await foodsCollection.deleteOne(query);
            res.send(result)
        })

        app.delete('/purchase/:id' , async(req , res)=>{
            const id = req.params.id;
            const query = {_id:new ObjectId(id)};
            const result = await purchaseCollection.deleteOne(query);
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