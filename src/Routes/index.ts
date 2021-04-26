// import * as express from "express";
import bodyParser from "body-parser";
import { CreateUsersAction, GetUsersAction } from "../Actions";

var express = require('express')
var router = express.Router()

// middleware that is specific to this router
router.use(function timeLog (req: any, res: any, next: any) {
  console.log('Time: ', Date.now())
  next()
})

// home page
router.get( "/", ( req: any, res: any ) => {
    res.render( "index" );
} );

// users list
router.get( "/users", async ( req: any, res: any ) => {
    const { status, data } = await(new GetUsersAction().Execute(req.query));
    res
    .status(status.code)
    .send(status.code === 200 ? { users: data }: { message: status.message} );
} );

// users post
router.post( "/users", async ( req: any, res: any ) => {
    const { status, data } = await(new CreateUsersAction().Execute(req.body));
    console.log('status', status);
    console.log('data', data);
    res
    .status(status.code)
    .send(status.code === 200 ? { user: data }: { message: status.message} );
} );

// // users list
// app.put( "/users", async ( req: any, res ) => {
//     const { status, data } = await(new UpdateUsersAction().Execute(req.query));
//     res
//     .status(status.code)
//     .send(status.code === 200 ? { users:data }: { message: status.message} );
// } );
module.exports = router;