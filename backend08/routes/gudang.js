const express = require('express');
const router = express.Router();
// import express validator
const { body, validationResult } = require('express-validator');
// import database
const connection = require('../config/db');

const authenticateToken = require('../routes/auth/midleware/authenticateToken')

router.get('/gudang',authenticateToken, function (req, res) {
    connection.query('SELECT * FROM gudang ORDER BY id_gudang DESC', function (err, rows) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            console.log('Query result:', rows); // Log the query result for debugging
            return res.status(200).json({
                status: true,
                message: 'Data Gudang',
                data: rows,
            });
        }
    });
});

router.post('/gudang',authenticateToken,  [
    // validation
    body('nama_gudang').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }
    const Data = {
        nama_gudang: req.body.nama_gudang,
    };
    connection.query('INSERT INTO gudang SET ?', Data, function (err, result) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(201).json({
                status: true,
                message: 'Success..!',
                data: { id_gudang: result.insertId, ...Data },
            });
        }
    });
});







router.patch('/gudang/:id',authenticateToken,  [
    body('nama_gudang').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }
    const id = req.params.id;
    const Data = {
        nama_gudang: req.body.nama_gudang,
    };
    connection.query(`UPDATE gudang SET ? WHERE id_gudang = ${id}`, Data, function (err, result) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Update Success..!',
            });
        }
    });
});

router.delete('/gudang/(:id)',authenticateToken,  function (req, res) {
    const id = req.params.id;
    connection.query(`DELETE FROM gudang WHERE id_gudang = ${id}`, function (err, result) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data has been deleted!',
            });
        }
    });
});

module.exports = router;
