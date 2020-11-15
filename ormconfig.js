module.exports = {
    type: "mongodb",
    url: process.env.DB_URL,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    synchronize: true,
    logging: true,
    ssl: true,
    entities: [
       "src/entity/**/*.ts"
    ]
}