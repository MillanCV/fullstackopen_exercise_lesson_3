const mongoose = require('mongoose')

if (process.argv.length < 3) {
  exit_with_ussage()
}

const password = process.argv[2]

const url = `mongodb+srv://admin:${password}@fullstackopen.tvmfhoa.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}

else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(result => {
    console.log('person saved!')
    mongoose.connection.close()
  })
}

else {
  exit_with_ussage()
}




function exit_with_ussage() {
  console.log('give password as argument if you want a list of persons')
  console.log('give password, name and a phone number as arguments if you want to add a person')
  process.exit(1)
}





