"use strict";

const mongoose = require("mongoose");
const { MONGO_URI } = require("../config");
class Database {
	constructor() {
		this.connect();
	}
	connect(type = "mongodb") {
		if (1 === 1) {
			mongoose.set("debug", true);
			mongoose.set("debug", { color: true });
		}

		mongoose
			.connect(MONGO_URI)
			.then((_) => console.log("Database connected"))
			.catch((err) => console.error(err));
		const db = mongoose.connection;
		db.on("error", console.error.bind(console, "connection error:"));
		db.once("open", function () {
			console.log("Connected to MongoDB");
		});
	}
	static getInstance() {
		if (!Database.instance) {
			Database.instance = new Database();
		}
		return Database.instance;
	}
}

const instanceMongoDb = Database.getInstance();

module.exports = instanceMongoDb;