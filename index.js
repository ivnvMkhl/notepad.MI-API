require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const errorsMiddleware = require('./middlewares/errors-middleware')

const authRouter = require('./basicRouter')

const app = express()
const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.text())
app.use(cookieParser())
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)
app.use('/api', authRouter)
app.use(errorsMiddleware)

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.resolve((__dirname, 'puplic', 'favicon.ico')))
})

const start = async () => {
  try {
    app.listen(PORT, () => console.log(`Server has been started on ${PORT} PORT...`))
  } catch (e) {
    console.log(e)
  }
}

start()
