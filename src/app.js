const express = require('express')
const bcrypt = require("bcryptjs")
const session = require('express-session');
const bodyParser = require('body-parser');


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
/*
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Putnik = require('../views/pages/putnikbkp.js').default;

*/
//////////////////////////////// MAIL ///////////////////////////
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'carrsharee78@gmail.com',
        pass: 'avjo abbf vtvz qhoo'
    }
});

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
} 

app.post('/register', async (req, res) => {
  const emailsend=req.body.email

  if (!emailsend) {
    return res.status(400).send('Email is required');
  }

  const token = generateRandomString(6);

  const mailConfigurations = {

   
    from: 'carrsharee78@gmail.com',

    to: emailsend,

    
    subject: 'Верификација e-mail адресе',
    
    
    text:`Здраво!
        Ви сте приступили нашем сајту Car Share 
        и унели своју e-mail адресу. 
        

        Ваш верификациони код је: ${token}

        Хвала, 
        Надамо се да ћете уживати у коришћењу наших услуга.
    `
    
};

  const{email,ime,prezime,br_telefona,prebivaliste,passwordR}=req.body;

  try{
    await prisma.putnik.create({
      data: {
        Email: email,
        Password: passwordR,
        ime: ime,
        prezime: prezime,
        broj_telefona: br_telefona,
        prebivaliste: prebivaliste,
        email_ver: false,
        email_code: token,
      }
    });
  }catch(error){
    console.error('Error adding putnik: ', error);
    res.status(500).send('Error adding putnik ');
  }

  transporter.sendMail(mailConfigurations, function(error, info){
    if (error) throw Error(error);
    console.log('Email Sent Successfully');
    console.log(info);
});

  res.redirect('/mailcheck'); 

});

app.get('/mailcheck', (req, res) => {
 
      res.render('mailcheck');
});

app.post('/mailcheck', async (req, res) => {
  const{code}=req.body;
  try {
    const user = await prisma.putnik.findFirst({
      where: { email_code: code }
    });
    console.log(user.Email,user.id)
    if(user){
      try {
        await prisma.putnik.update({
            where: {
                id: user.id,
            },
           data: {
            email_ver: true,
           }
        });
        res.redirect('/plogin');
    } catch (error) {
        console.error('Error finding user code:', error);
        res.status(500).send('Error finding user code');
    }
    }
   
  } catch (error) {
    console.error('Error finding email code:', error);
    res.status(500).send('Internal server error');
  }
 
});


///////////////////////////////////////////////////////////////////




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
      res.redirect(`/vozac/${user.id}`);

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
app.get('/vozac/:id', (req, res) => {
  const id = req.params.id; 
  if (!req.session.userId) {
    return res.redirect('/valogin');
  }
    return res.redirect(`/vozaclog/${id}`)
});

app.get('/logoutva', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out.');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});
app.get('/logoutp', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out.');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
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

app.get('/plogin/putnik',async (req,res)=>{
  
  try {
    const voznje = await prisma.voznja.findMany({
      /*include: {
        usr: true,  
      },*/
    });
    res.render('putnik', { voznje })
  }catch (error) {
    console.error('Error retrieving voznje:', error);
    res.status(500).send('Error retrieving voznje');
  }
});



app.listen(port,host, () => {
console.log(`app.listen`)
})

///////////////////////////////////   PUTNIK        /////////////////////////////////




app.post('/check-plogin',async (req,res)=>{
  const { email, password } = req.body;

  try {
    const putnik = await prisma.putnik.findUnique({
      where: { Email: email }
    });
    if (putnik && await password == putnik.Password) {
      req.session.userId = putnik.id;
      req.session.email = putnik.Email;

      res.redirect('/putnik');
 
      
    } else {
      res.send('Invalid username or password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal server error');
  }
});
app.get('/putnik',(req, res)=>{
  
  if (!req.session.userId) {
    return res.redirect('/plogin');
  }
    return res.redirect('/plogin/putnik');
});



/////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////    VOZAC        /////////////////////////////////

// VOZAC prva strana ucitavanje svih voznji
app.get('/vozaclog/:id', async (req, res) => {
  try {
    const userid = parseInt(req.params.id, 10); 
    const voznje = await prisma.voznja.findMany({
      where: {
        usrId: userid
      },  
      orderBy: [
        {
          id: 'desc'
        }
      ]
    });



    res.render('vozac', { voznje: voznje, userid: userid });
  } catch (error) {
    console.error('Error retrieving voznje:', error);
    res.status(500).send('Error retrieving voznje');
  }
});

////////////////////////////////////////////////


//dodavanje voznje od strane VOZACA
app.post('/add-voznja', async (req, res) => {
  
  const vozacid = parseInt(req.query.vozac_id, 10);
  
  console.log("vozacid ",vozacid);
  console.log(req.body)
  const { startDestination, endDestination, departureLocation, pricePerPerson, seats, departureDate, departureTime } = req.body;
  
  const departureDateTime = new Date(`${departureDate}T${departureTime}`);

  try {
      await prisma.voznja.create({
          data: {
            usrId: vozacid,
              pocetna_destinacija: startDestination,
              krajnja_destinacija: endDestination,
              mesto_polaska: departureLocation,
              Broj_mesta: parseInt(seats, 10),
              Datum_i_vreme_polaska: new Date(departureDateTime),
             
              Cena:  parseFloat(pricePerPerson),
          }
      });
      res.redirect(`/vozaclog/${vozacid}`);
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
  
  const userId = parseInt(req.query.userId, 10);
  const voznjaId = parseInt(req.query.voznja_id, 10);
  const { departureDate, departureTime } = req.body;
  
  const departureDateTime = new Date(`${departureDate}T${departureTime}:00Z`);
  console.log("user id",userId)
  try {
      await prisma.voznja.update({
          where: {
              id: voznjaId,
          },
          data: {
            Datum_i_vreme_polaska: departureDateTime
          },
      });
      res.redirect(`/vozaclog/${userId}`);
  } catch (error) {
      console.error('Error updating voznja:', error);
      res.status(500).send('Error updating voznja');
  }
});

///////////////////////////////////////////////////////

///////////////////////////////////////      ADMIN        ///////////////////////

app.get('/adminlog', async (req, res) => {

  const vozaci = (await prisma.usr.findMany({
    where: {
        admin_check: false,
    }})).reverse();
  res.render('admin', {putnici:NaN, vozaci:vozaci });

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
        email_ver: true,
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
      const vozaci = (await prisma.usr.findMany({
        where: {
            admin_check: false,
        }})).reverse();
      res.render('admin', {putnici:NaN, vozaci:vozaci });
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
      res.render('admin', { vozaci:NaN,putnici:putnici });
  } catch (error) {
      console.error('Error retrieving putnici:', error);
      res.status(500).send('Error retrieving putnici');
  }
});
/////////////////////////////////////////////////////



app.post('/izmeni-vozaca/:id', async (req, res) => {
  const userId = parseInt(req.params.id,10)
  const { username, email, password } = req.body; 
  try {
   
    const updatedUser = await  prisma.usr.update({
      data:{
        username: username,
        Email: email,
        Password: password
      }
    , 
      where: {
        id: userId
      }
    });
    
    res.redirect("/odabir_vozaci")
  } catch (error) {
    console.error('Greška prilikom ažuriranja korisnika:', error);
    res.status(500).json({ success: false, message: 'Greška prilikom ažuriranja korisnika.' });
  }
});


app.post('/obrisi-vozaca/:id', async (req, res) => {
  const userId = parseInt(req.params.id,10)

  try {

    const deletedUser = await  prisma.usr.delete({
      where: {
        id: userId
      }
    });

    if (deletedUser) {
      
      res.redirect("/odabir_vozaci")
    } 
  } catch (error) {
    console.error('Greška prilikom brisanja korisnika:', error);
    res.status(500).json({ success: false, message: 'Greška prilikom brisanja korisnika.' });
  }
});

app.post('/izmeni-putnika/:id', async (req, res) => {
  const userId = parseInt(req.params.id,10)
  const { username, email, password } = req.body; 
  try {
   
    const updatedUser = await  prisma.putnik.update({
      data:{
          username: username,
          Email: email,
          Password: password
    }
    , 
      where: {
        id: userId
      }
    });
    res.redirect("/odabir_putnici")
  } catch (error) {
    console.error('Greška prilikom ažuriranja korisnika:', error);
  }
});


app.post('/obrisi-putnika/:id', async (req, res) => {
  const userId = parseInt(req.params.id,10)

  try {

    const deletedUser = await  prisma.putnik.delete({
      where: {
        id: userId
      }
    });

    if (deletedUser) {
      res.redirect("/odabir_putnici")
    } 
  } catch (error) {
    console.error('Greška prilikom brisanja korisnika:', error);
    res.status(500).json({ success: false, message: 'Greška prilikom brisanja korisnika.' });
  }
});
