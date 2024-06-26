const express = require('express')
const app = express()
const path = require('path');
const port = 3000
const host = '0.0.0.0'
app.use(express.static('../public'));
app.set('view engine', 'ejs');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

app.set('views', path.join(__dirname, '../views/pages'));


/*async function main() {
  try {
    await prisma.putnik.create({
      data: {
        ime: 'Alice',
        Email: 'alice@prisma.io',
        broj_telefona: "03043030",
        prebivaliste: "mrcic bb",
        prezime: "ksksk",
        Password: "kskskksksks"
      },
    });

    const sviputnici = await prisma.putnik.findMany();
    console.dir(sviputnici, { depth: null });
  } catch (error) {
    console.error("Error in main function: ", error);
  }
}*/
app.get('/',(req,res)=>{
    // main();
    res.render('index')
})
app.get('/plogin',(req,res)=>{
  res.render('plogin')
})

app.get('/valogin',(req,res)=>{
  res.render('valogin')
})

app.get('/valogin/vozac',(req,res)=>{
  res.render('vozac')
})

app.get('/valogin/admin',(req,res)=>{
  res.render('admin')
})

app.get('/plogin/putnik',(req,res)=>{
  res.render('putnik')
})

app.listen(port,host, () => {
  console.log(`app.listen`)
})