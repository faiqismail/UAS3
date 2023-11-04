const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const connection = require('../config/db');

// Create a new pegawai
router.post('/pegawai', [
    body('nama').notEmpty(),
    body('email').notEmpty().isEmail(),
    body('password').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }
    const Data = {
        nama: req.body.nama,
        email: req.body.email,
        password: req.body.password
    };
    connection.query('INSERT INTO register_pegawai SET ?', Data, (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false
            });
        } else {
            return res.status(201).json({
                status: true,
                data: { id_register_pegawai: result.insertId, ...Data }
            });
        }
    });
});


// Get all pegawai
router.get('/pegawai', (req, res) => {
    connection.query('SELECT * FROM register_pegawai', (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Pegawai',
                data: rows,
            });
        }
    });
});

router.patch('/pegawai/:id', [
    body('nama').notEmpty().withMessage('Field nama harus diisi'),
    body('email').notEmpty().withMessage('Field email harus diisi').isEmail().withMessage('Email tidak valid'),
    body('password').notEmpty().withMessage('Field password harus diisi')
], (req, res) => {
    const id = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    const Data = {
        nama: req.body.nama,
        email: req.body.email,
        password: req.body.password
    };

    connection.query('UPDATE register_pegawai SET ? WHERE id_register_pegawai = ?', [Data, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Pegawai berhasil diubah..!',
                data: { id_register_pegawai: id, ...Data }
            });
        }
    });
});


// Delete pegawai by ID
router.delete('/pegawai/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM register_pegawai WHERE id_register_pegawai = ?', id, (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Pegawai berhasil dihapus..!',
            });
        }
    });
});

module.exports = router;
