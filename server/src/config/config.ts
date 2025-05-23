import dotenv from "dotenv"
import { Secret } from "jsonwebtoken"
dotenv.config()

const config = {
    node:{
        port:process.env.PORT,
        environment:process.env.NODE_ENV
    },
    mongodb:{
        uri:process.env.MONGODB_URI
    },
    jwt:{
        secret: process.env.JWT_SECRET as Secret,
        expiresIn: "24h"
    }
}

export default config