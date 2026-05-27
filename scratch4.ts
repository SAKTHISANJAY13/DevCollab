import mongoose from "mongoose";
import { encrypt, decrypt } from "./lib/crypto.ts";
import { UserKeyModel } from "./models/UserKey.ts";

async function check() {
  process.env.SECRET_KEY = "a8f3d9c2b1e7f4a6d8c0e2f5b9a1c3d7";
  await mongoose.connect("mongodb+srv://gokulravi320_db_user:R6aZcZcb6wRBCpfJ@cluster0.i4buojl.mongodb.net/?appName=Cluster0");
  const keyDoc = await UserKeyModel.findOne({ provider: "gemini" }).lean();
  if (keyDoc) {
    const apiKey = decrypt(keyDoc.apiKey);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log(JSON.stringify(data.models?.map((m: any) => m.name), null, 2) || data);
  } else {
    console.log("No Gemini key found");
  }
  process.exit(0);
}
check();
