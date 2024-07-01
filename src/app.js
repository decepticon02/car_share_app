const express = require('express')
const bcrypt = require("bcryptjs")
const session = require('express-session');


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { mainModule } = require('process');
const { getMaxListeners } = require('events');

const app = express()
const path = require('path');
const port = 3000
const host = '0.0.0.0'
app.use(express.static('../public'));
app.set('view engine', 'ejs');

//mail verification jwt token
const jwt = require('jsonwebtoken');


app.use(express.json());
app.set('views', path.join(__dirname, '../views/pages'));

/*async function addadmininitial(){
  await prisma.usr.create({
    data: {
      Email: "admin@vs.rs",
      Password: "admin",
      username: "admin",
      admin_check: true
    }
  });
}*/
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

/// Middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});


////////////////////////////////   LOGIN SVI ////////////////////////////////

app.post('/login', async (req, res) => {
  const { usrname, password } = req.body;

  try {
    const user = await prisma.usr.findUnique({
      where: { username: usrname }
    });
    if (user && await password == user.Password) {
      req.session.userId = user.id;
      req.session.userName = user.username;
      req.session.admin_check=user.admin_check;

    if(req.session.admin_check)
      res.redirect('/admin');
    else{
      res.redirect('/vozac');

    }
      
    } else {
      res.send('Invalid username or password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/admin', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/valogin');
  }
    return res.redirect('/adminlog');
});
app.get('/vozac', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/valogin');
  }
    return res.redirect('/vozaclog')
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out.');
    }
    res.redirect('/valogin');
  });
});


app.get('/',(req,res)=>{
  res.render('index')
})

app.get('/plogin',(req,res)=>{
res.render('plogin')
})

app.get('/valogin',(req,res)=>{
  
res.render('valogin')
})

app.get('/plogin/putnik',(req,res)=>{
res.render('putnik')
})


app.listen(port,host, () => {
console.log(`app.listen`)
})

///////////////////////////////////   PUTNIK        /////////////////////////////////

app.get('/verify/:token', (req, res)=>{
  const {token} = req.params;

  // Verifying the JWT token 
  jwt.verify(token, 'ourSecretKey', function(err, decoded) {
      if (err) {
          console.log(err);
          res.send("Email verification failed, possibly the link is invalid or expired");
      }
      else {
          res.send("Email verifified successfully");
      }
  });
});



/////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////    VOZAC        /////////////////////////////////

// VOZAC prva strana ucitavanje svih voznji
app.get('/vozaclog', async (req, res) => {
  try {
      const voznje = (await prisma.voznja.findMany()).reverse();
      res.render('vozac', { voznje });
  } catch (error) {
      console.error('Error retrieving voznje:', error);
      res.status(500).send('Error retrieving voznje');
  }
});

////////////////////////////////////////////////


//dodavanje voznje od strane VOZACA
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
      res.redirect('/vozaclog');
  } catch (error) {
      console.error('Error adding voznja:', error);
      res.status(500).send('Error adding voznja');
  }
});
///////////////////////////////////////////////////////

//brisanje voznje od strane VOZACA
app.delete('/delete-voznja/:id', async (req, res) => {
  const voznjaId = parseInt(req.params.id, 10);

  try {
    await prisma.voznja.delete({
      where: { id: voznjaId },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting voznja:', error);
    res.status(500).json({ success: false, message: 'Error deleting voznja' });
  }
});
/////////////////////////////////////////////////////

//menjanje vremena voznje od strane VOZACA
app.post('/update-voznja', async (req, res) => {
  
  const voznjaId = parseInt(req.query.voznja_id, 10);
  const { departureDate, departureTime } = req.body;
  
  const departureDateTime = new Date(`${departureDate}T${departureTime}:00Z`);

  try {
      await prisma.voznja.update({
          where: {
              id: voznjaId,
          },
          data: {
            Datum_i_vreme_polaska: departureDateTime
          },
      });
      res.redirect('/vozaclog');
  } catch (error) {
      console.error('Error updating voznja:', error);
      res.status(500).send('Error updating voznja');
  }
});
///////////////////////////////////////////////////////

///////////////////////////////////////      ADMIN        ///////////////////////

app.get('/adminlog', async (req, res) => {
      res.render('admin');
});

//dodavanje VOZACA od strane admina
app.post('/add-vozac',async(req,res)=>{
  console.log(req.body)
  const{email,usrname,password}=req.body;

  try{
    await prisma.usr.create({
      data: {
        Email: email,
        Password: password,
        username: usrname,
      }
    });
    res.redirect('/adminlog');
  }catch(error){
    console.error('Error adding vozac: ', error);
    res.status(500).send('Error adding vozac ');
  }
});
////////////////////////////////////////////////////




//dodavanje PUTNIKA od strane admina
app.post('/add-putnik',async(req,res)=>{
  console.log(req.body)
  const{email,ime,prezime,br_telefona,prebivaliste,password}=req.body;

  try{
    await prisma.putnik.create({
      data: {
        Email: email,
        Password: password,
        ime: ime,
        prezime: prezime,
        broj_telefona: br_telefona,
        prebivaliste: prebivaliste,
      }
    });
    res.redirect('/adminlog');
  }catch(error){
    console.error('Error adding putnik: ', error);
    res.status(500).send('Error adding putnik ');
  }
});
///////////////////////////////////////////////////

//biranje ADMINA da se prikazu vozaci   //  NE RADI MI OVO
app.get('/odabir_vozaci', async (req, res) => {
  try {
      const vozaci = (await prisma.usr.findMany()).reverse();
      res.render('admin', { vozaci });
  } catch (error) {
      console.error('Error retrieving vozaci:', error);
      res.status(500).send('Error retrieving vozaci');
  }
});
////////////////////////////////////////////////////


//biranje ADMINA da se prikazu putnici // NE RADI MI OVO 
app.get('/odabir_putnici', async (req, res) => {
  try {
      const putnici = (await prisma.putnik.findMany()).reverse();
      res.render('admin', { putnici });
  } catch (error) {
      console.error('Error retrieving putnici:', error);
      res.status(500).send('Error retrieving putnici');
  }
});
/////////////////////////////////////////////////////




