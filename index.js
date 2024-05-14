const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

// middlewere
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    optionSuccessStatus: 200
}))
app.use(express.json())
app.use(cookieParser())
// verify token
const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).send({ message: 'unauthorize access' })
    }

    jwt.verify(token, process.env.VITE_JWT_secrete, (err, decoded) => {
        if (err) {
            console.log(err)
            return res.status(401).send({ message: 'unauthorize access' })
        }
        console.log(decoded)
        req.user = decoded;
        next()
    })

    console.log(token)


}


// mongodb code here 
// console.log(process.env.VITE_DBuser)

const uri = `mongodb+srv://${process.env.VITE_DBuser}:${process.env.VITE_DBpassword}@cluster0.rjjtc94.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const serviceCollection = client.db('restaurant').collection('service');

        // create jwt token
        app.post('/jwt', async (req, res) => {
            const paylod = req.body;
            console.log(paylod)
            const token = jwt.sign(paylod, process.env.VITE_JWT_secrete, { expiresIn: '1d' })
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            })
                .send({ success: true })
        })

        // Token clear form clicking on logout
        app.post('/logout', (req, res) => {
            res
                .clearCookie('token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                    maxAge: 0,
                })
                .send({ success: true })
        })



        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        })


        app.get('/foods', async (req, res) => {
            const searchText = req.query.search;
            // console.log(searchText)
            let query = {};

            if (searchText) {
                query = { name: { $regex: searchText, $options: 'i' } }
            };

            const result = await foodsCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/services', async (req, res) => {
            const result = await serviceCollection.find().toArray();
            res.send(result)
        })

        app.get('/foods/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            const tokenEmail = req.user.email;
            // console.log('food token email',tokenEmail)
            if (tokenEmail !== email) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const query = { 'addBy.email': email }
            const result = await foodsCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodsCollection.findOne(query);
            res.send(result)
        })

        app.get('/detail/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodsCollection.findOne(query);
            res.send(result)
        })

        app.get('/myPurchase/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            const tokenEmail = req.user.email;
            // console.log('token email',tokenEmail)
            if (tokenEmail !== email) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const query = { email: email }
            const result = await purchaseCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/topFoods', async (req, res) => {
            const sort = { purchase: -1 }
            const result = await foodsCollection.find().sort(sort).limit(6).toArray();
            res.send(result)
        })

        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const info = req.body;
            // console.log(info)
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: info.name,
                    imageURL: info.imageURL,
                    category: info.category,
                    quantity: info.quantity,
                    price: info.price,
                    addBy: info.addBy,
                    origin: info.origin,
                    textarea: info.textarea
                },
            };


            const result = await foodsCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user)
            const query = { email: user.email }
            const existingEmail = await usersCollection.findOne(query);
            if (!existingEmail) {
                const result = await usersCollection.insertOne(user);
                res.send(result)
            }
            res.send('user already exist')

        })

        app.post('/foods', async (req, res) => {
            const user = req.body;
            const servicer = req.body.addBy;
            const query = { 'addBy.email': servicer.email }
            const existingEmail = await serviceCollection.findOne(query);
            if (!existingEmail) {
                const resultOne = await serviceCollection.insertOne(servicer);
                res.send(resultOne);
            }
            // console.log(user.addBy)
            const result = await foodsCollection.insertOne(user);

            res.send(result)
        })

        app.post('/service', async (req, res) => {
            const user = req.body;
            const servicer = req.body.addBy;
            const query = { 'addBy.email': servicer.email }
            const existingEmail = await serviceCollection.findOne(query);
            if (!existingEmail) {
                const resultOne = await serviceCollection.insertOne(servicer);
                res.send(resultOne);
            }
            res.send('servicer all ready exist')
            // console.log(user.addBy)
            
        })


        app.post('/purchase', async (req, res) => {
            const purchaseData = req.body;
            const purchaseId = purchaseData.id;
            // console.log(purchaseData, purchaseId);
            const result = await purchaseCollection.insertOne(purchaseData);
            const filter = { _id: new ObjectId(purchaseId) }
            const options = { upsert: true }
            const doc = {
                $inc: { purchase: 1, quantity: -1 }
            }
            const updateFoodsCollection = await foodsCollection.updateOne(filter, doc, options)
            res.send(result)

        })


        app.delete('/foods-delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodsCollection.deleteOne(query);
            res.send(result)
        })

        app.delete('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
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