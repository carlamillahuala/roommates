const express = require('express');

//const enviar_email = require('./email.js');
const axios = require('axios');
const fs = require('fs').promises;
const uuid = require('uuid');

const app = express ()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));

app.get("/gastos", (req, res) => {
    let base_gastos= require('./db.json')
    console.log(base_gastos)
    let gastos=base_gastos.gastos
    res.send({ gastos })

})
app.get("/roommates", (req, res) => {
    let basedatos = require('./db.json')
    console.log(basedatos)
    let roommates=basedatos.roommates
    res.send({ roommates })
    
})  
    
        
//para obtener el nuevo usuario roommate 
async function nuevo_roommate() {
    const datos = await axios.get("https://randomuser.me/api")

//desempaquetar los datos de uno
    const randomuser = datos.data.results[0]
    return nuevo_user = {

        //Generamos el id se utiliza el slice para reducir el numero de caracteres
        id: uuid.v4().slice(30),
        nombre: randomuser.name.first + ' ' + randomuser.name.last
    
    }
}

app.post("/roommate", async (req, res) => {
    const roommate = await nuevo_roommate()


    //leemos el archivo creado
    let db = await fs.readFile('db.json', "utf-8")
    
    //trasformando de un string a un objeto
    db = JSON.parse(db)

    //enviamos la informacion a la base de datos
    db.roommates.push(roommate)


    //Finalmente guardo el nuevo usuario
    await fs.writeFile('db.json', JSON.stringify(db), "utf-8")
    res.send({ exito:"okey" })
})

// aca vamos a agregar un gasto
app.post('/gasto', async (req, res) => {
    let body;
    req.on('data', (payload) => {
        body = JSON.parse(payload);
        console.log(body);
    });
    req.on('end', async () => {
        console.log(body);

        // acá tenemos que crear el gasto genrandolo como objeto gasto
        const nuevo_gasto = {
            //identificar el gasto (llave)
            id: uuid.v4(),
            roommate: body.roommate,
            descripcion: body.descripcion,
            monto: body.monto
        }
        let db = await fs.readFile('db.json',"utf-8")
    
        //trasformando de un string a un objeto
        db = JSON.parse(db)

        //enviamos la informacion a la base de datos
        db.gastos.push(nuevo_gasto)

       //Finalmente guardo el nuevo gasto 
        await fs.writeFile('db.json', JSON.stringify(db), "utf-8")
        res.send({todo: 'ok' })
        
    });
});

//modificar gastos//
app.put('/gasto', async (req, res) => {
    //guardamos el id a modificar
    const id = req.query.id;
    
    let body;
    req.on('data', (payload) => {
        body = JSON.parse(payload);

        console.log(body);
    });
    req.on('end', async () => {
        console.log(body);
        //Leemos el archivo guardado//
        let db = await fs.readFile('db.json', "utf-8")
        
        //transformando de un string a objeto//
        db = JSON.parse(db);
        
        //buscamos el id unico asociado al gasto//
        db.gastos.map((gasto)=> {
            if (gasto.id == req.query.id) {
                gasto.monto = body.monto
                gasto.descripcion=body.descripcion
    }   
    })

        const roommate = db.roommates.find(r => r.nombre == body.roommate)
        let roommateold = roommate.debe
        console.log(roommateold)
        let roomatenew = roommate.debe
        const gastosRoommate = db.gastos.filter( g => g.roommate = roommate.nombre).map(g => g.monto).reduce( (x, y) => x + y)
        roommate.debe = gastosRoommate;


    //Finalmente guardo el nuevo gasto 
        await fs.writeFile('db.json', JSON.stringify(db), "utf-8")
        res.send({ todo: 'ok' });
        
    });
});
    
//esto es para borrar//
app.delete('/gasto', async(req, res) => {

    const id = req.query.id;
    console.log(id);

    let db = await fs.readFile("db.json", 'utf-8');
    db = JSON.parse(db);

    const arraygastos = db.gastos.filter(x => x.id !== id);
    db.gastos = arraygastos

    await fs.writeFile('db.json', JSON.stringify(db), 'utf-8');

    res.send(db);

});

app.listen(3000, ()=>console.log("servidor corriendo en el puerto 3000"));

