const express = require('express');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

//Middleware
app.use(cors());
app.use(express.json())
//for vercel

app.use(cors({
  origin: [""],
  methods:["POST", "GET"],
  Credential:true

}))

app.get('/', (req, res)=>{
    res.send("carGurdian server is running");
})

app.listen(port, ()=>{
    console.log(`CarGurdian is running on port number: ${port}`);
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.njjghgo.mongodb.net/?appName=Cluster0`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    const userCollection = client.db('carGurdian').collection('services');
    const bookingCollection = client.db('carGurdian').collection('bookings');

    //find all data from mongodb
    app.get('/services', async(req, res)=>{
        const cursor = userCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/services/:id', async(req, res)=>{
        const id = req.params.id;
        const query ={_id: new ObjectId(id)};
        const options = {
            projection: { _id: 1, title: 1, img:1, price:1, service_id:1 },
        };
        const result = await userCollection.findOne(query, options);
        res.send(result);
    })

    //Booking
    app.post('/bookings', async(req, res)=>{
      const booking= req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })

    //get booking data
    app.get('/bookings', async(req, res)=>{
      console.log(req.query.email);
      let query ={};
      if(req.query?.email){
        query ={email: req.query.email};
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    })

    //Delete data
    app.delete('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const query= {_id: new ObjectId(id)};
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })

    //update data
    app.patch('/bookings/:id', async(req, res)=>{ 
      const id = req.params.id;
      const filter= {_id: new ObjectId(id)};
      const updateBooking = req.body;
      console.log(updateBooking);
      const updateDoc = {
        $set: {
          plot: updateBooking.status
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

