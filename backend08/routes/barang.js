const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const connection = require('../config/db');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Jenis file tidak diizinkan'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get('/barang/data', (req, res) => {
    connection.query('SELECT b.id_barang, b.id_gudang, b.nomer_barcode, b.nama_produk, b.ket_produk, b.foto_produk, b.stok_produk, b.harga, g.nama_gudang FROM barang b JOIN gudang g ON b.id_gudang = g.id_gudang ORDER BY b.id_barang DESC;', (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Failed',
            });
        } else {
            const formattedData = rows.map(row => {
                return {
                    id_barang: row.id_barang,
                    nama_gudang: row.nama_gudang,
                    nomer_barcode: row.nomer_barcode,
                    nama_produk: row.nama_produk,
                    ket_produk: row.ket_produk,
                    foto_produk: row.foto_produk,
                    stok_produk: row.stok_produk,
                    harga: row.harga
                };
            });
            return res.status(200).json({
                status: true,
                message: 'Data Barang',
                data: formattedData
            });
        }
    });
});



router.post('/barang', upload.fields([{ name: 'foto_produk', maxCount: 1 }]), [
    body('id_gudang').notEmpty().withMessage('Field id_gudang harus diisi'),
    body('nomer_barcode').notEmpty().withMessage('Field nomer_barcode harus diisi'),
    body('nama_produk').notEmpty().withMessage('Field nama_produk harus diisi'),
    body('ket_produk').notEmpty().withMessage('Field ket_produk harus diisi'),
    body('stok_produk').notEmpty().withMessage('Field stok_produk harus diisi'),
    body('harga').notEmpty().withMessage('Field harga harus diisi')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    let Data = {
        id_gudang: req.body.id_gudang,
        nomer_barcode: req.body.nomer_barcode,
        nama_produk: req.body.nama_produk,
        ket_produk: req.body.ket_produk,
        foto_produk: req.files.foto_produk[0].filename,
        stok_produk: req.body.stok_produk,
        harga: req.body.harga
    };

    connection.query('INSERT INTO barang SET ?', Data, (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(201).json({
                status: true,
                message: 'Success..!',
                data: rows[0]
            });
        }
    });
});

router.get('/barang/:nomer_barcode', (req, res) => {
    let nomerBarcode = req.params.nomer_barcode;
    connection.query('SELECT b.id_barang, g.nama_gudang, b.nomer_barcode, b.nama_produk, b.ket_produk, b.foto_produk, b.stok_produk, b.harga FROM barang b JOIN gudang g ON b.id_gudang = g.id_gudang WHERE b.nomer_barcode = ?;', [nomerBarcode], (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        }
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            });
        } else {
            const formattedData = {
                id_barang: rows[0].id_barang,
                nama_gudang: rows[0].nama_gudang,
                nomer_barcode: rows[0].nomer_barcode,
                nama_produk: rows[0].nama_produk,
                ket_produk: rows[0].ket_produk,
                foto_produk: rows[0].foto_produk,
                stok_produk: rows[0].stok_produk,
                harga: rows[0].harga
            };
            return res.status(200).json({
                status: true,
                message: 'Data Barang',
                data: formattedData,
            });
        }
    });
});



router.patch(
    "/barang/:id",
    upload.single("foto_produk"),
    [
        body('id_gudang').notEmpty().withMessage('Field id_gudang harus diisi'),
        body('nomer_barcode').notEmpty().withMessage('Field nomer_barcode harus diisi'),
        body('nama_produk').notEmpty().withMessage('Field nama_produk harus diisi'),
        body('ket_produk').notEmpty().withMessage('Field ket_produk harus diisi'),
        body('stok_produk').notEmpty().withMessage('Field stok_produk harus diisi'),
        body('harga').notEmpty().withMessage('Field harga harus diisi')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array(),
            });
        }

        const id = req.params.id;

        const foto_produk = req.file ? req.file.filename : null;

        connection.query(
            `SELECT * FROM barang WHERE id_barang = ${id}`,
            (err, rows) => {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: "Server Error",
                    });
                }
                if (rows.length === 0) {
                    return res.status(404).json({
                        status: false,
                        message: "Not Found",
                    });
                }

                const foto_produkLama = rows[0].foto_produk;

                if (foto_produkLama && foto_produk) {
                    const pathFotoProduk = path.join(
                        __dirname,
                        "../public/images",
                        foto_produkLama
                    );
                    fs.unlinkSync(pathFotoProduk);
                }

                let Data = {
                    id_gudang: req.body.id_gudang,
                    nomer_barcode: req.body.nomer_barcode,
                    nama_produk: req.body.nama_produk,
                    ket_produk: req.body.ket_produk,
                    stok_produk: req.body.stok_produk,
                    harga: req.body.harga,
                };

                if (foto_produk) {
                    Data.foto_produk = foto_produk;
                }

                connection.query(
                    `UPDATE barang SET ? WHERE id_barang = ${id}`,
                    Data,
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({
                                status: false,
                                message: "Server Error",
                            });
                        } else {
                            return res.status(200).json({
                                status: true,
                                message: "Update Sukses..!",
                            });
                        }
                    }
                );
            }
        );
    }
);

router.delete('/barang/:id', (req, res) => {
    const id = req.params.id;

    connection.query(`SELECT * FROM barang WHERE id_barang = ${id}`, (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        }
        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            });
        }

        const foto_produkLama = rows[0].foto_produk;

        connection.query(`DELETE FROM barang WHERE id_barang = ${id}`, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Server Error',
                });
            }

            // Hapus file foto_produk jika ada
            if (foto_produkLama) {
                const pathFotoProdukLama = path.join(__dirname, '../public/images', foto_produkLama);
                fs.unlinkSync(pathFotoProdukLama);
            }

            return res.status(200).json({
                status: true,
                message: 'Data has been deleted!',
            });
        });
    });
});

module.exports = router;
