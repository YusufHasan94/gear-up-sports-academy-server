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
    // await client.connect();

    //collections 
    const database = client.db("gear-up-sports");    
    const classes =  database.collection("classes");
    const instructors = database.collection("instructors");
    const users = database.collection("users");
    const selectedClass = database.collection("carts");



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
    //delete selected class from list 
    app.delete("/carts/:id", async (req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await selectedClass.deleteOne(query);
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
    app.get("/users/admin/:email", async(req, res)=>{
        const email = req.params.email;
        const query = {email: email};
        const user = await users.findOne(query);
        const result = {admin: user?.role === 'admin'};
        res.send(result);
    })
    //approve cls by admin
    app.patch("/classes/status/allow/:id", async(req, res)=>{
        const id = req.params.id;
        const filterCls = {_id: new ObjectId(id)};
        const updateDoc ={
            $set:{
                status: 'approved'
            },
        };
        const result = await classes.updateOne(filterCls, updateDoc);
        res.send(result);
    })
    app.patch("/classes/status/deny/:id", async(req, res)=>{
        const id = req.params.id;
        const filterCls = {_id: new ObjectId(id)};
        const updateDoc ={
            $set:{
                status: 'denied'
            },
        };
        const result = await classes.updateOne(filterCls, updateDoc);
        res.send(result);
    })
    //get all classes requested by instructor
    app.get("/classes/requested", async(req, res)=>{
        const result = await classes.find().toArray();
        res.send(result);
    })

    //instructor
    app.patch("/users/instructor/:id", async(req, res)=>{
        const id = req.params.id;
        const filter ={_id: new ObjectId(id)};
        const updateDoc ={
            $set:{
                role: 'instructor'
            },
        };
        const result = await users.updateOne(filter, updateDoc);
        res.send(result);
    })
    app.get("/users/instructor/:email", async(req, res)=>{
        const email = req.params.email;
        const query = {email: email};
        const user = await users.findOne(query);
        const result = {admin: user?.role === 'instructor'};
        res.send(result);
    })
    app.post("/classes", async(req, res)=>{
        const newClass = req.body;
        const result = await classes.insertOne(newClass);
        res.send(result);
    })
    app.get("/instructor/classes", async(req, res)=>{
        const email = req.query.email;
        const query = {instructorEmail: email};
        const result = await classes.find(query).toArray();
        console.log(query, result);
        res.send(result);
    })
    //getting all instructors
    app.get("/instructors", async(req, res)=>{
        const role = req.query.role;
        const query = {role: 'instructor'};
        const result = await users.find(query).toArray();
        res.send(result);
    })
    //get all approved classes
    app.get("/classes", async(req, res)=>{
        const query = {status: 'approved'}
        const result = await classes.find(query).toArray();
        res.send(result);
    })
    //cart
    app.post("/carts", async(req, res)=>{
        const cls = req.body;
        const result = await selectedClass.insertOne(cls);
        res.send(result);
    })
    app.get("/carts", async(req, res)=>{
        const email = req.query.email;
        if(!email){
            console.log("email not found");
            res.send([]);
        }
        const query = {email : email};
        const result = await selectedClass.find(query).toArray();
        res.send(result);
    })
    //dummy
    app.get("/carts", async(req, res)=>{
        const email = req.query.email;
        const id = req.query.id;
        if(!email){
            console.log("email not found");
            res.send([]);
        }
        const query = {_id: new ObjectId(id), email : email};
        const result = await selectedClass.find(query).toArray();
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
