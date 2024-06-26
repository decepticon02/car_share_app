const express = require('express')
const app = express()
const path = require('path');
const port = 3000
const host = '0.0.0.0'
app.use(express.static('../public'));
app.set('view engine', 'ejs');



app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const { PrismaClient } = require('@prisma/client');
const { mainModule } = require('process');
const { getMaxListeners } = require('events');

const prisma = new PrismaClient();

app.set('views', path.join(__dirname, '../views/pages'));

async function main() {
  try {
    await prisma.usr.create({
      data: {
        Email: "rand@gmail.com",
        Password: "ksksks",
        username: "prvi korisnik",
      },
    });

    const sviusr = await prisma.usr.findMany();
    console.dir(sviusr, { depth: null });
  } catch (error) {
    console.error("Error in main function: ", error);
  }
}

app.post('/add-voznja', async (req, res) => {
  console.log(req.body)
  const { startDestination, endDestination, departureLocation, pricePerPerson, seats, departureDate, departureTime } = req.body;
  
  const departureDateTime = new Date(`${departureDate}T${departureTime}`);

  try {
      await prisma.voznja.create({
          data: {
            usrId: 1,
              pocetna_destinacija: startDestination,
              krajnja_destinacija: endDestination,
              mesto_polaska: departureLocation,
              Broj_mesta: parseInt(seats, 10),
              Datum_i_vreme_polaska: new Date(departureDateTime),
             
              Cena:  parseFloat(pricePerPerson),
          }
      });
      res.redirect('/valogin/vozac');
  } catch (error) {
      console.error('Error adding voznja:', error);
      res.status(500).send('Error adding voznja');
  }
});

app.post('/update-voznja', async (req, res) => {
  const { voznjaId, departureDate, departureTime } = req.body;

  
  const id = parseInt(voznjaId, 10);
  if (isNaN(id)) {
      return res.status(400).send('Invalid voznjaId');
  }

  
  const departureDateTime = new Date(`${departureDate}T${departureTime}:00Z`);

  try {
      await prisma.voznja.update({
          where: {
              id: id,
          },
          data: {
              Datum_polaska: departureDateTime,
              Vreme_polaska: departureDateTime,
          },
      });
      res.redirect('/valogin/vozac');
  } catch (error) {
      console.error('Error updating voznja:', error);
      res.status(500).send('Error updating voznja');
  }
});

app.get('/',(req,res)=>{
 // main()
    res.render('index')
})
app.get('/plogin',(req,res)=>{
  res.render('plogin')
})

app.get('/valogin',(req,res)=>{
  res.render('valogin')
})


app.get('/valogin/vozac', async (req, res) => {
  try {
      const voznje = (await prisma.voznja.findMany()).reverse();
      res.render('vozac', { voznje });
  } catch (error) {
      console.error('Error retrieving voznje:', error);
      res.status(500).send('Error retrieving voznje');
  }
});

app.get('/valogin/admin',(req,res)=>{
  res.render('admin')
})

app.get('/plogin/putnik',(req,res)=>{
  res.render('putnik')
})

app.listen(port,host, () => {
  console.log(`app.listen`)
})