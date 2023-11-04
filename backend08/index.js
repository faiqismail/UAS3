const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

const path = require('path');
app.use('/static', express.static(path.join(__dirname, 'public/images')));

const bodyPs = require('body-parser');
app.use(bodyPs.urlencoded({ extended: false }));
app.use(bodyPs.json());

const barangRouter = require('./routes/barang');
app.use(barangRouter);

const gudangRouter = require('./routes/gudang');
app.use(gudangRouter);

const pegawaiRouter = require('./routes/pegawai');
app.use(pegawaiRouter);

const feedbackRouter = require('./routes/feedback');
app.use(feedbackRouter);

app.listen(port, () => {
    console.log(`aplikasi berjalan di http:://localhost:${port}`);
});