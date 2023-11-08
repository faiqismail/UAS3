const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const connection = require('../config/db');

// GET all feedback
router.get('/feedback', (req, res) => {
    connection.query('SELECT * FROM feedback ORDER BY id_feedback DESC', (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            console.log('Query result:', rows);
            return res.status(200).json({
                status: true,
                message: 'Feedback Data',
                data: rows,
            });
        }
    });
});

// POST a new feedback with "date" and "nama_feedback" set automatically
router.post('/feedback', [
    body('nama_feedback').notEmpty(), // Menambahkan validasi untuk kolom 'nama_feedback' di atas 'email_pengirim'
    body('email_pengirim').isEmail(),
    body('keterangan').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }

    // Mendapatkan tanggal dan waktu saat ini di zona waktu "Asia/Jakarta" dan memformatnya
    const now = new Date();
    const jakartaTime = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' +
                       now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

    const Data = {
        nama_feedback: req.body.nama_feedback, // Menggunakan nilai dari kolom 'nama_feedback' di atas 'email_pengirim'
        email_pengirim: req.body.email_pengirim,
        keterangan: req.body.keterangan,
        date: jakartaTime, // Menggunakan tanggal dan waktu yang telah diambil
    };

    connection.query('INSERT INTO feedback SET ?', Data, (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(201).json({
                status: true,
                message: 'Feedback Submitted..!',
                data: { id_feedback: result.insertId, ...Data },
            });
        }
    });
});

// PATCH/update an existing feedback
router.patch('/feedback/:id', [
    body('nama_feedback').notEmpty(), // Menambahkan validasi untuk kolom 'nama_feedback' di atas 'email_pengirim'
    body('email_pengirim').isEmail(),
    body('keterangan').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }
    const id = req.params.id;
    const now = new Date();
    const jakartaTime = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' +
                       now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds(); // Definisikan ulang jakartaTime
    const Data = {
        nama_feedback: req.body.nama_feedback, // Menggunakan nilai dari kolom 'nama_feedback' di atas 'email_pengirim'
        email_pengirim: req.body.email_pengirim,
        keterangan: req.body.keterangan,
        date: jakartaTime, // Menggunakan tanggal dan waktu saat ini yang telah didefinisikan ulang
    };
    connection.query(`UPDATE feedback SET ? WHERE id_feedback = ${id}`, Data, (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Feedback Updated..!',
            });
        }
    });
});


// DELETE a feedback by ID
router.delete('/feedback/:id', (req, res) => {
    const id = req.params.id;
    connection.query(`DELETE FROM feedback WHERE id_feedback = ${id}`, (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Feedback has been deleted!',
            });
        }
    });
});

module.exports = router;
