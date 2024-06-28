const express = require("express")
const crypto = require("node:crypto")
const cors = require("cors")

const movies = require(".movies.json")
const {validateObject, validatePartialMovie} = require("./schemas/movies")
const PORT = process.env.PORT ?? '1234'

const app = express()

app.disable('x-powered-by')

app.use(express.json())

app.use(cors())


app.get('/movies', (req, res)=>{
    const { genre } = req.query
    if (genre) {
        const filteredMovies = movies.filter(
            movies => movies.genre.some(g => g.toLowerCase() == genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res)=>{
    const { id } = req.params
    const movie =  movies.find(movie => movie.id == id)
    if (movie) return res.json(movie)

    res.status(404).json({"msg": "Movie not found"}) 
})

app.post('/movies', (req, res)=>{
    res.header('Access-Control-Allow-Origin', '*')
    const result = validateObject(req.body)

    if (result.error){
        res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const newMovie = {
        id: crypto.ramdomUUID,
        ...result.data
    }

    movies.push(newMovie)

    res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res)=>{
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id == id)

    console.log(id, movieIndex)

    if (movieIndex == -1) return res.status(404).json({"msg": "Movie not found"})

    movies.splice(movieIndex, 1)

    return res.status(200).json({msg: 'Movie deleted'})

})

app.patch('/movies/:id', (req, res)=>{
    const result = validatePartialMovie(res.body)
    
    if (!result.success) {
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const { id } = req.params

    const movieIndex = movies.findIndex(movie => movie.id == id)

    if (movieIndex == -1) return res.status(404).json({msg: 'Movie not found'})

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

app.options('/movies/:id', (req, res)=>{
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PACTH, DELETE')
    res.sendStatus(200)
})

app.listen(PORT, ()=>{
    console.log(`Server listening on port: http://localhost:${PORT}`)
})