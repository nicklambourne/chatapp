let express = require('express');
let rooms = require('./data/rooms.json');
let users = require('./data/users.json');
let messages = require('./data/messages.json');
let uuid = require('node-uuid');
let _ = require('lodash');

let router = express.Router();
module.exports = router;

router.get('/rooms', function (req, res) {
    res.json(rooms);
});

router.route('/rooms/:id/messages')
    .all(function (req, res, next) {
        let roomId = req.params.id;
        let room = _.find(rooms, r => r.id === roomId);
        if (!room) {
            res.sendStatus(404);
            return;
        }
        res.locals.room = room;
        next();
    })
    .get(function (req, res) {
        let roomMessages = messages
            .filter(m => m.roomId === res.locals.room.id)
            .map(m => {
                let user = _.find(users, u => u.id === m.userId);
                return {text: `${user.name}: ${m.text}`};
        });
        res.json({
            room: res.locals.room,
            messages: roomMessages
        });
    })
    .post(function (req, res) {
        let message = {
            roomId: res.locals.room.id,
            text: req.body.text,
            userId: req.user,
            id: uuid.v4()
        };
        messages.push(message);
        res.sendStatus(200);
    })
    .delete(function (req, res) {
        let roomId = req.params.roomId;
        messages = messages.filter(m => m.roomId !== roomId);
        res.sendStatus(200);
    });
