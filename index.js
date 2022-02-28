const express = require('express')
const app = express();

// database
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

// middleware
const cors = require('cors');
require('dotenv').config();
app.use(express.json());
app.use(cors());

// port
const port = process.env.PORT || 5000;


// Mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a7zq8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// connect Database
async function run() {
    try {

        // Connect the client to the server
        await client.connect();

        // Establish and verify connection
        const database = client.db("ask-me-society");
        // collections
        const userCollection = database.collection("users");
        const allPostsCollection = database.collection("all-posts");
        // const orderCollection = database.collection("orders");


        /**
         * Handle User
         */

        // register users
        app.post('/create-user', async (req, res) => {

            const user = req.body;
            const result = await userCollection.insertOne(user);

            res.json(result);
        })


        /**
         * handle post
         */

        // add my post
        app.post('/add-post', async (req, res) => {

            const post = req.body;
            const result = await allPostsCollection.insertOne(post);

            res.json(result);
        });

        // get all post list
        app.get('/all-post', async (req, res) => {

            const cursor = allPostsCollection.find({});
            const result = await cursor.toArray();

            res.json(result);
        });

        // get single post details
        app.get('/question-details/:num', async (req, res) => {

            const num = req.params.num;

            const postDetails = await allPostsCollection.findOne({ _id: ObjectId(num) });

            res.json(postDetails);
        });

        // add answer
        app.post('/submit-answer/:id', async (req, res) => {

            const id = req.params.id;
            const answer = req.body

            // console.log(answer)


            // create a filter for a movie to update
            const filter = { _id: ObjectId(id) };
            // this option instructs the method to create a document if no documents match the filter
            const options = { upsert: false };
            // create a document that sets the plot of the movie
            const updateDoc = {
                $push: {
                    answers: answer
                },
            };
            const result = await allPostsCollection.updateOne(filter, updateDoc, options);

            res.json(result);
        });


        /**
         * Manage Orders
         */

        // place order
        app.post('/place-order', async (req, res) => {

            const orderData = req.body;
            const result = await orderCollection.insertOne(orderData);

            res.json(result);
        });





    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('ask me society!')
})

app.listen(port, () => {
    console.log(`ask me society listening on port ${port}`)
})