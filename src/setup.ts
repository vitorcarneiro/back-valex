import dotenv from 'dotenv';

let envFile = '.env.example';

if (process.env.NODE_ENV === 'prod') envFile = '.env';

dotenv.config({
    path: envFile,
});