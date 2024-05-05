import 'dotenv/config';
import express from 'express';
import initApp from './src/modules/app.router.js';
import cors from 'cors'; 
import compression from 'compression'; 
const app = express();
app.use(cors());
app.use(compression());
const PORT = process.env.PORT || 3700;
initApp(app,express);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
