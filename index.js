const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kaasp8g.mongodb.net/?retryWrites=true&w=majority`;

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

    //collections 
    const database = client.db("gear-up-sports");    
    const classes =  database.collection("classes");
    const instructors = database.collection("instructors");
    const users = database.collection("users");

    //Route start from here 
    app.get("/classes", async(req, res)=>{
        const result = await classes.find().toArray();
        res.send(result);
    })

    app.get("/instructors",async(req, res)=>{
        const result = await instructors.find().toArray();
        res.send(result);
    })

    //user 
    app.post("/users", async(req, res)=>{
        const user = req.body;
        const query = {email : user.email}
        const exists = await users.findOne(query);
        if(exists) {
            return res.send({message: "user exists"})
        }
        const result = await users.insertOne(user);
        res.send(result);
    })

    app.get("/users", async(req, res)=>{
        const result = await users.find().toArray();
        res.send(result);
    })

    //admin
    app.patch("/users/admin/:id", async(req, res)=>{
        const id = req.params.id;
        const filter ={_id: new ObjectId(id)};
        const updateDoc ={
            $set:{
                role: 'admin'
            },
        };
        const result = await users.updateOne(filter, updateDoc);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send("Academy Running successfully");
});

app.listen(port, ()=>{
    console.log(`GearUp academy running on ${port}`);
})
