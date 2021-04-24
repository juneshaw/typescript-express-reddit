"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const Actions_1 = require("../Actions");
const register = (app) => {
    app.get("/", (req, res) => {
        res.render("index");
    });
    app.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { status, data } = yield (new Actions_1.GetUsersAction().Execute(req.query));
        res
            .status(status.code)
            .send(status.code === 200 ? { users: data } : { message: status.message });
    }));
    app.post("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('req.body', req.body);
        const { status, data } = yield (new Actions_1.CreateUsersAction().Execute(req.query));
        res
            .status(status.code)
            .send(status.code === 200 ? { users: data } : { message: status.message });
    }));
};
exports.register = register;
