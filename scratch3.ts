import mongoose from "mongoose";
import { UserKeyModel } from "./models/UserKey.ts";

async function check() {
  await mongoose.connect("mongodb+srv://gokulravi320_db_user:R6aZcZcb6wRBCpfJ@cluster0.i4buojl.mongodb.net/?appName=Cluster0");
  const keys = await UserKeyModel.find({}).lean();
  console.log("DB KEYS: ");
  keys.forEach(k => {
    console.log(`User: ${k.userId}, Provider: ${k.provider}, isActive: ${k.isActive}`);
  });
  process.exit(0);
}
check();
