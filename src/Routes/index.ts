import * as express from "express";
import { CreateUsersAction, GetUsersAction } from "../Actions";

export const register = ( app: express.Application ) => {

    // home page
    app.get( "/", ( req: any, res ) => {
        res.render( "index" );
    } );

    // users list
    app.get( "/users", async ( req: any, res ) => {
        const { status, data } = await(new GetUsersAction().Execute(req.query));
        res
        .status(status.code)
        .send(status.code === 200 ? { users:data }: { message: status.message} );
    } );

    // users post
    app.post( "/users", async ( req: any, res ) => {
        console.log('req.body', req.body);
        const { status, data } = await(new CreateUsersAction().Execute(req.query));
        res
        .status(status.code)
        .send(status.code === 200 ? { users:data }: { message: status.message} );
    } );

    // // users list
    // app.put( "/users", async ( req: any, res ) => {
    //     const { status, data } = await(new UpdateUsersAction().Execute(req.query));
    //     res
    //     .status(status.code)
    //     .send(status.code === 200 ? { users:data }: { message: status.message} );
    // } );
};