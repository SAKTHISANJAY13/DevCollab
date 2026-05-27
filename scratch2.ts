import mongoose from "mongoose";
import fs from "fs";
import { UserKeyModel } from "./models/UserKey";

const env = fs.readFileSync(".env.local", "utf8");
env.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2].replace(/["']/g, "").trim();
  }
});

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const keys = await UserKeyModel.find({}).lean();
  console.log("ALL KEYS IN DB:");
  console.log(JSON.stringify(keys, null, 2));
  process.exit(0);
}
check();
