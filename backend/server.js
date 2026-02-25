require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigins = [
  'https://gurbaaniliving.com',
  'https://www.gurbaaniliving.com',
  'http://localhost:5173',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running 🚀' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/hero-images', require('./routes/hero-images'));


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gurbaani Living backend running on http://localhost:${PORT}`);
});
