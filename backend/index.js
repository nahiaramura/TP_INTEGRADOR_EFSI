import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import tagRoutes from './routes/tag.routes.js';
import eventLocationRoutes from './routes/eventLocation.routes.js';
import eventCategoryRoutes from './routes/eventCategory.routes.js'; // 👉 agregado
import locationRoutes from './routes/location.routes.js';

dotenv.config();

const app = express(); 

app.use(cors()); 
app.use(express.json());

app.use('/api/user', authRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/event-location', eventLocationRoutes);
app.use('/api/event-category', eventCategoryRoutes); // 👉 agregado
app.use("/api/locations", locationRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
