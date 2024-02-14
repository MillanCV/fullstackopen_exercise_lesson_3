require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(express.json());
app.use(cors())


morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get("/info", (request, response) => {
    Person.countDocuments({})
        .then(count => {
            const date = Date()
            response.send(
                `<p>Phonebook has info for ${count} people<p/>
            <p>${date}</p>`
            )
        })

})

app.get("/api/persons", (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get("/api/persons/:id", (request, response, next) => {
    const id = request.params.id
    Person.findById(id)
        .then(person => { response.json(person) })
        .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})



app.post("/api/persons", (request, response) => {
    const body = request.body

    if (!body.name && !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    if (!body.name)
        return response.status(400).json({
            error: 'name is missing'
        })

    if (!body.number)
        return response.status(400).json({
            error: 'number is missing'
        })

    Person.findOne({ 'name': body.name }).then(person => {
        if (person) {
            return response.status(400).json({
                error: 'name must be unique'
            })
        }

        const new_person = new Person({
            name: body.name,
            number: body.number,
        })

        new_person.save().then(savedPerson => {
            response.json(savedPerson)
        })

    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
