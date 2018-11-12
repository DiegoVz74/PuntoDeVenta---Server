const Usuario = require("../models/usuario");
const express = require('express');
const bcrypt = require('bcrypt');
const _ = require("underscore");

const app = express();

app.get('/', function(req, res) {
    res.json('Hello World')
})

app.get('/usuarios', function(req, res) {

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;

    desde = Number(desde);
    limite = Number(limite);


    Usuario.find({ userState: true })
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Usuario.count({ userState: true }, (err, conteo) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                res.json({
                    ok: true,
                    usuarios,
                    total_usuarios: conteo
                });
            });
        })


})

app.post('/usuarios', function(req, res) {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        usuario: body.usuario,
        contraseña: bcrypt.hashSync(body.contraseña, 10),
        tipo: body.tipo,
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })

})

app.put('/usuarios/:id', function(req, res) {
        let id = req.params.id;
        let body = _.pick(req.body, ["nombre", "usuario", "tipo", "direccion", "ciudad", "estado", "cp", "telefono", "email", "img", "userState"]);

        Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                usuario: usuarioDB
            });
        })
    })
    /*
    app.delete('/usuarios/:id', function(req, res) {

        let id = req.params.id;
        Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            if (usuarioBorrado == null) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: "Usuario no encontrado"
                    }
                })
            }

            res.json({
                ok: true,
                usuario: usuarioBorrado
            });
        })

    })
    */

app.delete('/usuarios/:id', function(req, res) {

    let id = req.params.id;
    let cambiaEstado = {
        userState: false
    }

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true, runValidators: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    })

})
module.exports = app;